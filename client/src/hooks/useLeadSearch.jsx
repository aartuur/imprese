import { useState } from "react";

export const useLeadSearch = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchLeads = async (filters) => {
    setLoading(true);
    setError(null);
    setLeads([]);

    try {
      const params = new URLSearchParams({
        country: filters.country,
        city: filters.city,
        limit: filters.limit.toString(),
        category: filters.category 
      });

      const response = await fetch(
        `https://imprese-2.onrender.com/api/v1/leads?${params.toString()}`,
      );

      if (!response.ok) {
        if (response.status === 422) throw new Error("Parametri non validi.");
        throw new Error(`Errore Server: ${response.status}`);
      }

      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { leads, loading, error, searchLeads };
};
