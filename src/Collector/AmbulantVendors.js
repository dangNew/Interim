import React, { useEffect, useState } from 'react';
import { interimDb } from '../components/firebase.config'; // Correct import path
import { collection, getDocs } from 'firebase/firestore';
import { FaEye } from 'react-icons/fa';

const AmbulantVendors = () => {
  const [vendors, setVendors] = useState([]);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const querySnapshot = await getDocs(collection(interimDb, 'approved_vendors'));
        const vendorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVendors(vendorsData);
      } catch (error) {
        console.error('Error fetching vendors: ', error);
      }
    };

    fetchVendors();
  }, []);

  return (
    <div className="ambulant-vendors">
      <h2>Ambulant Vendors</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date Created</th>
            <th>Approved By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id}>
              <td>{vendor.first_name} {vendor.last_name}</td>
              <td>{new Date(vendor.create_at.seconds * 1000).toLocaleDateString()}</td>
              <td>{vendor.approved_by}</td>
              <td>
                <button className="view-btn">
                  <FaEye />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .ambulant-vendors {
          padding: 20px;
        }

        .ambulant-vendors h2 {
          font-size: 24px;
          margin-bottom: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }

        th {
          background-color: #f2f2f2;
        }

        .view-btn {
          background-color: transparent;
          border: none;
          color: #007bff;
          cursor: pointer;
        }

        .view-btn:hover {
          color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default AmbulantVendors;
