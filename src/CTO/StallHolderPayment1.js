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

const StallHolderPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vendorId } = location.state || {};
  const [vendorDetails, setVendorDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const pdfRef = useRef();

  useEffect(() => {
    if (vendorId) {
      const vendorRef = doc(stallholderDb, "approvedVendors", vendorId);
      getDoc(vendorRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const fullName = `${data.firstName} ${data.middleName || ""} ${
              data.lastName
            }`;
            const stallNumber = data.stallInfo?.stallNumber || "N/A";
            const contactNumber = data.contactNumber || "N/A";

            setVendorDetails({
              name: fullName,
              stallNumber: stallNumber,
              contactNumber: contactNumber,
            });
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.error("Error getting document:", error);
        });
    }
  }, [vendorId]);

  useEffect(() => {
    if (vendorId) {
      const paymentsRef = collection(stallholderDb, "stall_payment");
      const q = query(paymentsRef, where("vendorId", "==", vendorId));
      getDocs(q)
        .then((querySnapshot) => {
          const paymentData = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const dueDate = data.dueDate.toDate();
            const year = dueDate.getFullYear();
            const month = dueDate.toLocaleString("default", { month: "long" });
            const day = dueDate.getDate();

            const total =
              (data.dailyPayment || 0) +
              (data.garbageFee || 0) +
              (data.surcharge || 0);
            const interestRateInPercentage = data.interestRate
              ? data.interestRate * 100
              : 0;
            const amountIntRate = data.interestRate
              ? (total * interestRateInPercentage) / 100
              : 0;
            const amountDue = total + amountIntRate;
            const status = data.status || "N/A";

            paymentData.push({
              year: year,
              month: month,
              day: day,
              dueDate: dueDate, // Store the original dueDate for sorting
              dailyPayment: data.dailyPayment || 0,
              garbageFee: data.garbageFee || 0,
              surcharge: data.surcharge || 0,
              total: total,
              interestRate: interestRateInPercentage,
              amountIntRate: amountIntRate,
              amountDue: amountDue,
              status: status,
            });
          });

          // Sort payments by dueDate in descending order
          paymentData.sort((a, b) => b.dueDate - a.dueDate);

          setPayments(paymentData);
        })
        .catch((error) => {
          console.error("Error fetching payment data:", error);
        });
    }
  }, [vendorId]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const filteredPayments = payments.filter((payment) => {
    const paymentDate = payment.dueDate;
    const paymentYear = paymentDate.getFullYear();
    const paymentMonth = paymentDate.getMonth();

    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-").map(Number);
      return (
        payment.status === "Paid" ||
        (payment.status === "paid" &&
          paymentYear === year &&
          paymentMonth === month - 1)
      ); // Months are 0-indexed
    }

    return payment.status === "Paid" || payment.status === "paid";
  });

  const totalDailyPayment = filteredPayments
    .reduce((sum, payment) => sum + payment.dailyPayment, 0)
    .toFixed(2);
  const totalGarbageFee = filteredPayments
    .reduce((sum, payment) => sum + payment.garbageFee, 0)
    .toFixed(2);
  const totalSurcharge = filteredPayments
    .reduce((sum, payment) => sum + payment.surcharge, 0)
    .toFixed(2);
  const totalAmount = filteredPayments
    .reduce((sum, payment) => sum + payment.total, 0)
    .toFixed(2);
  const totalInterestRate = filteredPayments
    .reduce((sum, payment) => sum + payment.interestRate, 0)
    .toFixed(2);
  const totalAmountIntRate = filteredPayments
    .reduce((sum, payment) => sum + payment.amountIntRate, 0)
    .toFixed(2);
  const totalAmountDue = filteredPayments
    .reduce((sum, payment) => sum + payment.amountDue, 0)
    .toFixed(2);

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
      pdf.save("stall_holder_payment_report.pdf");
    });
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
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
        <input
          type="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />
      </div>

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
          Stall Holder Payment Report
        </h2>

        <div
          style={{ margin: "20px 0", textAlign: "left", paddingLeft: "20px" }}
        >
          <p>
            <strong>Vendor ID:</strong> {vendorId || "N/A"}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>
              Stall Number:{" "}
              {vendorDetails ? vendorDetails.stallNumber : "Loading..."}
            </p>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              Name: {vendorDetails ? vendorDetails.name : "Loading..."}
            </p>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              Contact Number:{" "}
              {vendorDetails ? vendorDetails.contactNumber : "Loading..."}
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
                  Year
                </th>
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
                  Status
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Daily Stall Rental
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Garbage Fee
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Surcharge
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Total
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Interest Rate
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Amount Int. Rate
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  Amount Due
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {payment.year}
                  </td>
                  <td
                    style={{ border: "1px solid #ddd", padding: "8px" }}
                  >{`${payment.month} ${payment.day}`}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {payment.status}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    ₱{payment.dailyPayment || 0}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    ₱{payment.garbageFee || 0}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    ₱{payment.surcharge || 0}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    ₱{payment.total || 0}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {payment.interestRate.toFixed(2) || "0"}%
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    ₱{payment.amountIntRate.toFixed(2) || 0}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    ₱{payment.amountDue.toFixed(2) || 0}
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: "bold", backgroundColor: "#f2f2f2" }}>
                <td colSpan="3">Total Amount Due</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  ₱{totalDailyPayment}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  ₱{totalGarbageFee}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  ₱{totalSurcharge}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  ₱{totalAmount}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {totalInterestRate}%
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  ₱{totalAmountIntRate}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  ₱{totalAmountDue}
                </td>
              </tr>
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

export default StallHolderPayment;
