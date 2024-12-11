import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { stallholderDb } from "../components/firebase.config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import ctoImage from "../images/unnamed";
import cebuMarketImage from "../images/cebumarket";

const TransactionDetails = () => {
  const { date } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [collectorDetailsMap, setCollectorDetailsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactionDetails = async () => {
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

        const transactionsQuery = query(
          collection(stallholderDb, "payment_ambulant"),
          where("date", ">=", startDate),
          where("date", "<", endDate)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);

        if (!transactionsSnapshot.empty) {
          const transactionsData = transactionsSnapshot.docs.map((doc) => ({
            ...doc.data(),
            referenceNumber: doc.id, // Use document ID as reference number
          }));

          // Fetch collector details for each transaction
          const collectorIds = [
            ...new Set(
              transactionsData.map((transaction) => transaction.collector)
            ),
          ];
          const collectorDetailsMap = {};

          for (const collectorId of collectorIds) {
            const collectorQuery = query(
              collection(stallholderDb, "ambulant_collector"),
              where("collector", "==", collectorId)
            );
            const collectorSnapshot = await getDocs(collectorQuery);

            if (!collectorSnapshot.empty) {
              const collectorDoc = collectorSnapshot.docs[0];
              const collectorData = collectorDoc.data();
              collectorDetailsMap[collectorId] = collectorData;
            }
          }

          setCollectorDetailsMap(collectorDetailsMap);
          setTransactions(transactionsData);
        } else {
          setError("No transactions found for the selected date");
        }
      } catch (error) {
        setError("Error fetching transaction details");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [date]);

  if (loading) {
    return (
      <p
        style={{
          textAlign: "center",
          fontSize: "18px",
          color: "#888",
          marginTop: "20px",
        }}
      >
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <p
        style={{
          textAlign: "center",
          fontSize: "18px",
          color: "#ff0000",
          marginTop: "20px",
        }}
      >
        {error}
      </p>
    );
  }

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add images
    doc.addImage(ctoImage, "PNG", 20, 10, 30, 30);
    doc.addImage(cebuMarketImage, "PNG", 160, 10, 30, 30);

    // Add text
    doc.setFontSize(12);
    doc.text("Republic of the Philippines", 105, 15, { align: "center" });
    doc.text("City of Cebu", 105, 20, { align: "center" });
    doc.text("OFFICE OF THE CITY ADMINISTRATION", 105, 25, { align: "center" });
    doc.text("CITY TREASURER'S OFFICE", 105, 30, { align: "center" });

    doc.setFontSize(14);
    doc.text("Transaction Details", 105, 50, { align: "center" });

    // Add table
    const tableData = transactions.map((transaction) => [
      transaction.referenceNumber,
      new Date(transaction.date.seconds * 1000).toLocaleDateString(),
      transaction.zone,
      transaction.space_rate,
      transaction.number_of_tickets,
      `₱${transaction.total_amount.toFixed(2)}`,
    ]);

    // Calculate total amount
    const totalAmount = transactions.reduce(
      (sum, transaction) => sum + transaction.total_amount,
      0
    );

    // Add total amount row
    tableData.push([
      "",
      "",
      "",
      "",
      "Total Amount",
      `₱${totalAmount.toFixed(2)}`,
    ]);

    doc.autoTable({
      head: [
        [
          "Reference Number",
          "Date",
          "Zone",
          "Space Rate",
          "Number of Tickets",
          "Total Amount",
        ],
      ],
      body: tableData,
      startY: 60,
      theme: "grid",
      headStyles: {
        fillColor: [242, 242, 242],
        textColor: [0, 0, 0],
        fontSize: 12,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 10,
        halign: "center",
      },
    });

    doc.save("transaction_details.pdf");
  };

  // Calculate total amount for all transactions
  const totalAmount = transactions.reduce(
    (sum, transaction) => sum + transaction.total_amount,
    0
  );

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
            textAlign: "left",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaArrowLeft style={{ marginRight: "10px" }} /> Back
        </button>
        <button
          onClick={generatePDF}
          style={{
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaDownload /> Download PDF
        </button>
      </div>

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
        </div>
        <img
          src={cebuMarketImage}
          alt="Cebu Market Logo"
          style={{ width: "80px", height: "80px", marginLeft: "30px" }}
        />
      </div>

      <h2 style={{ margin: "20px 0", fontSize: "24px", fontWeight: "bold" }}>
        Transaction Details
      </h2>

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
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Reference Number
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Date
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Zone
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Space Rate
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Number of Tickets
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Total Amount
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Collector ID
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Collector Name
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const collectorDetails =
                collectorDetailsMap[transaction.collector];
              const fullName = `${collectorDetails?.firstName || ""} ${
                collectorDetails?.middleName || ""
              } ${collectorDetails?.lastName || ""}`;
              return (
                <tr key={transaction.referenceNumber}>
                  <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                    {transaction.referenceNumber}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                    {new Date(
                      transaction.date.seconds * 1000
                    ).toLocaleDateString()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                    {transaction.zone}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                    {transaction.space_rate}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                    {transaction.number_of_tickets}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                    ₱{transaction.total_amount.toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                    {transaction.collector}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                    {fullName}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td
                colSpan="5"
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Total Amount
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  fontWeight: "bold",
                }}
              >
                ₱{totalAmount.toFixed(2)}
              </td>
              <td
                colSpan="2"
                style={{ border: "1px solid #ddd", padding: "12px" }}
              ></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionDetails;
