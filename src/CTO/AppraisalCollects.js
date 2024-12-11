import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { stallholderDb } from "../components/firebase.config";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import ctoImage from "../images/unnamed";
import cebuMarketImage from "../images/cebumarket";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const AppraisalCollects = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collectorDetails, setCollectorDetails] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pdfRef = useRef();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const collector = queryParams.get("collector");
    const date = queryParams.get("date");
    console.log("Query Params:", { collector, date }); // Debug log

    const fetchItems = async () => {
      setLoading(true);
      try {
        const selectedDate = new Date(date);
        const startDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        const endDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate() + 1
        );

        const appraisalsQuery = query(
          collection(stallholderDb, "appraisals"),
          where("created_date", ">=", startDate),
          where("created_date", "<", endDate)
        );
        const appraisalsSnapshot = await getDocs(appraisalsQuery);

        if (!appraisalsSnapshot.empty) {
          const appraisalsData = appraisalsSnapshot.docs.map((doc) => ({
            ...doc.data(),
            code: doc.id, // Use document ID as item code
            date: doc.data().created_date
              ? new Date(doc.data().created_date.seconds * 1000)
              : new Date(),
            createdDate: doc.data().created_date
              ? new Date(
                  doc.data().created_date.seconds * 1000
                ).toLocaleDateString()
              : "N/A",
            location: doc.data().appraisal_assign || "N/A", // Fetch location
          }));

          // Fetch collector details for each appraisal
          const collectorIds = [
            ...new Set(appraisalsData.map((appraisal) => appraisal.appraisal)),
          ];
          const collectorDetailsMap = {};

          for (const collectorId of collectorIds) {
            const collectorQuery = query(
              collection(stallholderDb, "appraisal_user"),
              where("appraisal", "==", collectorId)
            );
            const collectorSnapshot = await getDocs(collectorQuery);

            if (!collectorSnapshot.empty) {
              const collectorDoc = collectorSnapshot.docs[0];
              const collectorData = collectorDoc.data();
              collectorDetailsMap[collectorId] = collectorData;
            }
          }

          const filteredItems = appraisalsData.filter(
            (item) =>
              collectorDetailsMap[item.appraisal]?.firstname +
                " " +
                collectorDetailsMap[item.appraisal]?.lastname ===
              collector
          );
          setItems(filteredItems);

          // Set collector details
          const collectorDetail =
            collectorDetailsMap[filteredItems[0]?.appraisal];
          setCollectorDetails({
            name: `${collectorDetail?.firstname} ${collectorDetail?.lastname}`,
            id: collectorDetail?.appraisal,
            location: filteredItems[0]?.location,
          });
        } else {
          setError("No appraisals found for the selected date");
        }
      } catch (error) {
        setError("Error fetching appraisal details");
      } finally {
        setLoading(false);
      }
    };

    if (collector && date) {
      fetchItems();
    }
  }, [location.search]);

  const downloadPDF = () => {
    const input = pdfRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4"); // Set orientation to 'l' for landscape
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Calculate margins (1/2 inch = 12.7 mm)
      const margin = 12.7;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        pdfWidth - 2 * margin,
        pdfHeight - 2 * margin
      );
      pdf.save("appraisal_details.pdf");
    });
  };

  if (loading) {
    return <p style={{ textAlign: "center", fontSize: "18px" }}>Loading...</p>;
  }

  if (error) {
    return <p style={{ textAlign: "center", fontSize: "18px" }}>{error}</p>;
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          marginBottom: "20px",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaArrowLeft style={{ marginRight: "10px" }} /> Back
      </button>

      <div ref={pdfRef}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <img
            src={ctoImage}
            alt="CTO Logo"
            style={{ width: "80px", height: "80px", marginRight: "30px" }}
          />
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
              Republic of the Philippines
            </p>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
              City of Cebu
            </p>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
              OFFICE OF THE CITY ADMINISTRATION
            </p>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
              CITY TREASURER'S OFFICE
            </p>
          </div>
          <img
            src={cebuMarketImage}
            alt="Cebu Market Logo"
            style={{ width: "80px", height: "80px", marginLeft: "30px" }}
          />
        </div>

        <h2 style={{ margin: "20px 0", fontSize: "18px", fontWeight: "bold" }}>
          Appraisal Report
        </h2>

        <div
          style={{ margin: "20px 0", textAlign: "left", paddingLeft: "20px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>
              <strong>Collector ID:</strong> {collectorDetails?.id || "N/A"}
            </p>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              <strong>Name:</strong> {collectorDetails?.name || "Loading..."}
            </p>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              <strong>Location:</strong>{" "}
              {collectorDetails?.location || "Loading..."}
            </p>
          </div>
        </div>

        <div style={{ marginTop: "20px", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: "0 auto",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Item Code
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Product Name
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Unit
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Quantity
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Total Amount
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {item.createdDate}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {item.code}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {item.goods_name}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {item.unit_measure}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {item.quantity}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    ₱{item.total_amount.toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {item.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={downloadPDF}
        style={{
          backgroundColor: "#28a745", // Green background color
          color: "white",
          border: "none",
          padding: "10px",
          fontSize: "14px",
          cursor: "pointer",
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginLeft: "auto",
        }}
      >
        <FaDownload style={{ marginRight: "8px" }} /> Download PDF
      </button>
    </div>
  );
};

export default AppraisalCollects;
