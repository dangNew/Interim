import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { stallholderDb } from "../components/firebase.config";
import { collection, getDocs, query, where } from "firebase/firestore";
import styled from "styled-components";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import ctoImage from "../images/unnamed.png";
import cebuMarketImage from "../images/cebumarket.png";

// Styled components
const DashboardContainer = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
`;

const Header = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const TableContainer = styled.div`
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px;
    text-align: left;
    border: 1px solid #ddd;
  }

  th {
    background-color: #4caf50;
    color: white;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: #333;
`;

const NoDataMessage = styled.p`
  text-align: center;
  color: #888;
  font-size: 18px;
  margin-top: 20px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const DateInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const SubHeader = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #555;
`;

const DownloadButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #4caf50;
  color: white;
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: #45a049;
  }
`;

const FiltersRightSide = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  align-items: center;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const HeaderText = styled.div`
  text-align: center;
  margin: 0 20px;
`;

const Appraisals = () => {
  const { collectorName } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const navigate = useNavigate();

  const applyFilter = useCallback(
    (data) => {
      let filteredData = [...data];
      if (dateFilter) {
        filteredData = filteredData.filter((item) => {
          const createdDate = item.date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
          return createdDate === dateFilter;
        });
      }
      return filteredData;
    },
    [dateFilter]
  );

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const appraisalsSnapshot = await getDocs(
        collection(stallholderDb, "appraisals")
      );
      const appraisalsData = await Promise.all(
        appraisalsSnapshot.docs.map(async (doc) => {
          const appraisalData = doc.data();

          const appraisalUserQuery = query(
            collection(stallholderDb, "appraisal_user"),
            where("appraisal", "==", appraisalData.appraisal)
          );
          const appraisalUserSnapshot = await getDocs(appraisalUserQuery);

          let collector = "Unknown";
          if (!appraisalUserSnapshot.empty) {
            const appraisalUserData = appraisalUserSnapshot.docs[0].data();
            collector = `${appraisalUserData.firstname} ${appraisalUserData.lastname}`;
          }

          return {
            code: doc.id,
            productName: appraisalData.goods_name,
            unit: appraisalData.unit_measure,
            quantity: appraisalData.quantity,
            totalAmount: appraisalData.total_amount,
            collector,
            date: appraisalData.created_date
              ? new Date(appraisalData.created_date.seconds * 1000)
              : null,
            createdDate: appraisalData.created_date
              ? new Date(
                  appraisalData.created_date.seconds * 1000
                ).toLocaleDateString()
              : "N/A",
          };
        })
      );

      const filteredItems = applyFilter(
        appraisalsData.filter((item) => item.collector === collectorName)
      );

      // Sort items by date in descending order
      filteredItems.sort((a, b) => b.date - a.date);

      setItems(filteredItems);
      setLoading(false);
    };

    fetchItems();
  }, [collectorName, dateFilter, applyFilter]);

  const handleBack = () => {
    navigate(-1);
  };

  const generatePDF = async () => {
    const doc = new jsPDF();

    // Function to load images as base64
    const loadImageAsBase64 = async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            console.log(`Image loaded: ${url}`); // Log successful load
            resolve(base64data);
          };
          reader.onerror = () => {
            console.error(`Error reading image: ${url}`); // Log read error
            reject(new Error("Failed to read image"));
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error loading image:", error);
        return null; // Return null if the image fails to load
      }
    };

    // Load images as base64 before adding them to the PDF
    const ctoImageBase64 = await loadImageAsBase64(ctoImage);
    const cebuMarketImageBase64 = await loadImageAsBase64(cebuMarketImage);

    // Add images to the PDF only if they loaded successfully
    if (ctoImageBase64) doc.addImage(ctoImageBase64, "PNG", 20, 10, 30, 30);
    if (cebuMarketImageBase64)
      doc.addImage(cebuMarketImageBase64, "PNG", 160, 10, 30, 30);

    // Header text
    doc.setFontSize(12);
    doc.text("Republic of the Philippines", 105, 15, { align: "center" });
    doc.text("City of Cebu", 105, 20, { align: "center" });
    doc.text("OFFICE OF THE CITY ADMINISTRATION", 105, 25, { align: "center" });
    doc.text("CITY TREASURER'S OFFICE", 105, 30, { align: "center" });

    // Main title
    doc.setFontSize(14);
    doc.text("Transaction History", 105, 50, { align: "center" });

    // Add table of transactions
    doc.autoTable({
      head: [
        [
          "Item Code",
          "Product Name",
          "Unit",
          "Quantity",
          "Total Amount",
          "Date Created",
        ],
      ],
      body: items.map((item) => [
        item.code || "N/A",
        item.productName || "N/A",
        item.unit || "N/A",
        item.quantity || "N/A",
        `₱${item.totalAmount.toFixed(2)}`, // Add peso sign
        item.createdDate || "N/A",
      ]),
      startY: 60,
      theme: "grid",
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontSize: 10,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 10,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto" },
        2: { cellWidth: "auto" },
        3: { cellWidth: "auto" },
        4: { cellWidth: "auto" }, // Total Amount column
        5: { cellWidth: "auto" }, // Date Created column
      },
      styles: {
        overflow: "linebreak",
        cellPadding: 2,
      },
      margin: { top: 10, left: 10, right: 10, bottom: 10 },
      didDrawPage: (data) => {
        // Add footer with page number
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      const amount = item.totalAmount; // Directly use the number
      return sum + (isNaN(amount) ? 0 : amount); // Add amount if valid, otherwise add 0
    }, 0);

    // Add total amount to the PDF
    doc.text(
      `Total Amount: ₱${totalAmount.toFixed(2)}`,
      105,
      doc.autoTable.previous.finalY + 10,
      { align: "center" }
    );

    // Save the PDF
    doc.save("appraisalPayment_history.pdf");
  };

  return (
    <DashboardContainer>
      <BackButton onClick={handleBack}>
        <FaArrowLeft /> Back
      </BackButton>
      <HeaderContainer>
        <img
          src={ctoImage}
          alt="CTO Logo"
          style={{ width: "80px", height: "80px", marginRight: "30px" }}
        />
        <HeaderText>
          <p
            style={{
              margin: "0 0 5px 0",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Republic of the Philippines
          </p>
          <p
            style={{
              margin: "0 0 5px 0",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            City of Cebu
          </p>
          <p
            style={{
              margin: "0 0 5px 0",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            OFFICE OF THE CITY ADMINISTRATION
          </p>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
            CITY TREASURER'S OFFICE
          </p>
        </HeaderText>
        <img
          src={cebuMarketImage}
          alt="Cebu Market Logo"
          style={{ width: "80px", height: "80px", marginLeft: "30px" }}
        />
      </HeaderContainer>
      <Header>History of Payment in Appraisal</Header>
      <SubHeader>Collector: {collectorName}</SubHeader>

      {/* Filter Section */}
      <FilterContainer>
        <div>
          <DateInput
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </FilterContainer>

      {loading ? (
        <LoadingMessage>Loading...</LoadingMessage>
      ) : items.length === 0 ? (
        <NoDataMessage>No Data</NoDataMessage>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Product Name</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Date Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.code}>
                  <td>{item.code}</td>
                  <td>{item.productName}</td>
                  <td>{item.unit}</td>
                  <td>{item.quantity}</td>
                  <td>₱{item.totalAmount.toFixed(2)}</td>
                  <td>{item.createdDate}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      <FiltersRightSide>
        <DownloadButton onClick={generatePDF}>
          <FaDownload /> Download PDF
        </DownloadButton>
      </FiltersRightSide>
    </DashboardContainer>
  );
};

export default Appraisals;
