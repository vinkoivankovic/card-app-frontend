// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";

type CardStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  oib: string;
  cardStatus: CardStatus;
}

const url:string ="http://localhost:8081/api/v1";

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState<Omit<Client, 'id'>>({
    firstName: '',
    lastName: '',
    oib: '',
    cardStatus: 'PENDING'
  });
  const [editStatus, setEditStatus] = useState<{ oib: string; status: CardStatus | null }>({ oib: '', status: null });
  
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${url}/get-all`);
        if (!response.ok) throw new Error("Failed to fetch clients");
        const data = await response.json();
        console.log(data);
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const deleteClient = async (oib: string) => {
    try {
      const response = await fetch(`${url}/${oib}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        setClients(clients.filter(client => client.oib !== oib));
        console.log(`Client with OIB ${oib} deleted successfully.`);
      } else {
        console.error("Failed to delete the client");
      }
    } catch (error) {
      console.error("Error deleting the client:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${url}/card-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      });
      
      if (!response.ok) throw new Error('Failed to add client');
      const addedClient: Client = await response.json();
      setClients((prev) => [...prev, addedClient]);
      setNewClient({ firstName: '', lastName: '', oib: '', cardStatus: 'PENDING' });
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const editClientStatus = async (oib: string, newStatus: CardStatus) => {
    try {
      const response = await fetch(`${url}/edit-status/${oib}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardStatus: newStatus }),
      });
  
      if (response.ok) {
        const updatedClient: Client = await response.json();
        setClients(prev => 
          prev.map(client => (client.oib === updatedClient.oib ? updatedClient : client))
        );
        console.log(`Client status updated to ${newStatus} for OIB ${oib}.`);
      } else {
        console.error("Failed to update client status");
      }
    } catch (error) {
      console.error("Error updating client status:", error);
    }
  };

  return (

    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <h1 className="text-2xl font-bold">Client List</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={newClient.firstName}
          onChange={handleInputChange}
          required
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={newClient.lastName}
          onChange={handleInputChange}
          required
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
        />
        <input
          type="text"
          name="oib"
          placeholder="OIB"
          value={newClient.oib}
          onChange={handleInputChange}
          required
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
        />
        <select
          name="cardStatus"
          value={newClient.cardStatus}
          onChange={handleInputChange}
          required
          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="PENDING" >Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Client
        </button>
      </form>
      <ul className="w-full max-w-md">
        {clients.map((client) => (
          <li key={client.id} className="flex justify-between items-center p-4 border-b border-gray-200">
            <div>
              <p><strong>Name:</strong> {client.firstName} {client.lastName}</p>
              <p><strong>OIB:</strong> {client.oib}</p>
              <p><strong>Status:</strong> {client.cardStatus}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                onClick={() => deleteClient(client.oib)}
              >
                Delete
              </button>
              {client.cardStatus !== "PENDING" && (
                <button
                  className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
                  onClick={() => editClientStatus(client.oib, "PENDING")}
                >
                  Pending
                </button>
              )}
              {client.cardStatus !== "APPROVED" && (
                <button
                  className="px-2 py-1 text-sm bg-green-500 text-white rounded"
                  onClick={() => editClientStatus(client.oib, "APPROVED")}
                >
                  Approve
                </button>
              )}
              {client.cardStatus !== "REJECTED" && (
                <button
                  className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                  onClick={() => editClientStatus(client.oib, "REJECTED")}
                >
                  Reject
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
    </footer>
  </div>
  );
};
