import { useState, useEffect } from "react";
import axios from "axios";

export function getData(link) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://barangayapi.vercel.app/${link}`);
        setData(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [link]);

  return { data, error, loading };
}
