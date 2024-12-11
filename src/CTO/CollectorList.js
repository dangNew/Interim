import React, { useState, useEffect } from "react";
import { stallholderDb } from "../components/firebase.config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// Styled components
const DashboardContainer = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
  font-family: "Arial", sans-serif;
`;

const Header = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 26px;
  font-weight: bold;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FilterDropdown = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  font-size: 16px;
`;

const SearchBar = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  font-size: 16px;
  width: 300px;
  margin-left: 20px;
`;

const CollectorContainer = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: ${(props) => (props.isClickable ? "pointer" : "default")};
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }
`;

const CollectorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #333;
`;

const CollectorName = styled.h3`
  margin: 0;
  font-size: 18px;
`;

const CollectorTotal = styled.p`
  margin: 0;
  font-weight: bold;
  font-size: 16px;
`;

const CollectorLabel = styled.p`
  margin: 5px 0 0 0;
  font-size: 14px;
  color: #666;
`;

const LocationLabel = styled.p`
  margin: 5px 0;
  font-size: 14px;
  color: #888;
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 18px;
  color: #888;
`;

const NoDataMessage = styled.p`
  text-align: center;
  font-size: 18px;
  color: #888;
`;

const CollectorList = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminLocation, setAdminLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminLocation = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData && userData.email) {
          const adminQuery = query(
            collection(stallholderDb, "admin_users"),
            where("email", "==", userData.email)
          );
          const adminSnapshot = await getDocs(adminQuery);
          if (!adminSnapshot.empty) {
            const adminData = adminSnapshot.docs[0].data();
            setAdminLocation(adminData.location);
          }
        }
      } catch (error) {
        console.error("Error fetching admin location:", error);
      }
    };

    const fetchItems = async () => {
      const ambulantCollectorsSnapshot = await getDocs(
        collection(stallholderDb, "ambulant_collector")
      );
      const appraisalUsersSnapshot = await getDocs(
        collection(stallholderDb, "appraisal_user")
      );
      const appraisalsSnapshot = await getDocs(
        collection(stallholderDb, "appraisals")
      );
      const paymentAmbulantSnapshot = await getDocs(
        collection(stallholderDb, "payment_ambulant")
      );

      const ambulantCollectorsData = ambulantCollectorsSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (data.firstName && data.lastName) {
            return {
              id: doc.id,
              collector: `${data.firstName} ${data.lastName}`,
              zone: data.zone,
              type: "ambulant",
              location: data.location, // Ambulant location
            };
          }
          return null;
        })
        .filter((collector) => collector && collector.zone); // Filter out collectors without a zone

      const appraisalUsersData = appraisalUsersSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const firstName = data.firstName || data.firstname;
          const lastName = data.lastName || data.lastname;
          return {
            id: doc.id,
            collector: `${firstName} ${lastName}`,
            appraisal: data.appraisal,
            appraisal_assign: data.appraisal_assign,
            type: "appraisal",
            location: data.appraisal_assign, // Appraisal location
          };
        })
        .filter((collector) => collector.appraisal_assign); // Filter out collectors without an appraisal_assign

      const appraisalsData = appraisalsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          appraisal: data.appraisal,
          appraisal_assign: data.appraisal_assign,
          total_amount: data.total_amount,
        };
      });

      const paymentAmbulantData = paymentAmbulantSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          zone: data.zone,
          total_amount: data.total_amount,
        };
      });

      // Filter ambulant collectors based on matching zone in payment_ambulant
      const filteredAmbulantCollectorsData = ambulantCollectorsData.filter(
        (collector) =>
          paymentAmbulantData.some((payment) => payment.zone === collector.zone)
      );

      // Calculate totals for ambulant collectors
      filteredAmbulantCollectorsData.forEach((collector) => {
        collector.totalAmount = paymentAmbulantData
          .filter((payment) => payment.zone === collector.zone)
          .reduce((acc, payment) => acc + payment.total_amount, 0);
      });

      // Calculate totals for appraisal users
      appraisalUsersData.forEach((user) => {
        user.totalAmount = appraisalsData
          .filter(
            (appraisal) =>
              appraisal.appraisal === user.appraisal &&
              appraisal.appraisal_assign === user.appraisal_assign
          )
          .reduce((acc, appraisal) => acc + appraisal.total_amount, 0);
      });

      // Filter ambulant collectors based on admin location
      const filteredAmbulantCollectorsByLocation =
        filteredAmbulantCollectorsData.filter(
          (collector) => collector.location === adminLocation
        );

      // Filter appraisal users based on admin location
      const filteredAppraisalUsersData = appraisalUsersData.filter(
        (user) => user.appraisal_assign === adminLocation
      );

      setItems([
        ...filteredAmbulantCollectorsByLocation,
        ...filteredAppraisalUsersData,
      ]);
      setLoading(false);
    };

    fetchAdminLocation().then(() => fetchItems());
  }, [adminLocation]);

  const handleViewCollector = (collector, type, location, zone) => {
    if (type === "appraisal") {
      navigate(`/collector/${collector}`);
    } else if (type === "ambulant") {
      navigate(`/ambulant-collector/${collector}/${location}/${zone}`);
    }
  };

  const filteredItems = items
    .filter((item) => {
      if (filter === "All") return true;
      return item.type === filter;
    })
    .filter((item) => {
      return item.collector.toLowerCase().includes(searchTerm.toLowerCase());
    });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.collector]) {
      acc[item.collector] = [];
    }
    acc[item.collector].push(item);
    return acc;
  }, {});

  return (
    <DashboardContainer>
      <Header>List of Collectors</Header>
      <FilterContainer>
        <SearchBar
          type="text"
          placeholder="Search by collector name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterDropdown
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="ambulant">Ambulant Collector</option>
          <option value="appraisal">Appraisals Collector</option>
          <option value="stall">Stall Holders Collector</option>
        </FilterDropdown>
      </FilterContainer>

      {loading ? (
        <LoadingMessage>Loading, please wait...</LoadingMessage>
      ) : Object.keys(groupedItems).length > 0 ? (
        Object.keys(groupedItems).map((collector) => {
          const totalAmount = groupedItems[collector].reduce(
            (acc, item) => acc + (item.totalAmount || 0),
            0
          );
          const collectorType = groupedItems[collector][0].type;
          const location = groupedItems[collector][0].location; // Access location
          const zone = groupedItems[collector][0].zone; // Access zone

          return (
            <CollectorContainer
              key={collector}
              onClick={() =>
                handleViewCollector(collector, collectorType, location, zone)
              }
              isClickable={true}
            >
              <CollectorHeader>
                <CollectorName>{collector}</CollectorName>
                <CollectorTotal>
                  Total: ₱{totalAmount.toFixed(2)}
                </CollectorTotal>
              </CollectorHeader>
              <CollectorLabel>
                {collectorType === "ambulant"
                  ? "Collector for Ambulant"
                  : "Collector for Appraisal"}
              </CollectorLabel>
              <LocationLabel>
                Location: {location}{" "}
                {collectorType === "ambulant" ? `- Zone ${zone}` : ""}
              </LocationLabel>
            </CollectorContainer>
          );
        })
      ) : (
        <NoDataMessage>No data of Collector</NoDataMessage>
      )}
    </DashboardContainer>
  );
};

export default CollectorList;
