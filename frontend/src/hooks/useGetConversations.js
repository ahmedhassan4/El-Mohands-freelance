import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function useGetConversations() {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const getConversations = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/users/getUsersSidebar");
        const data = await res.json();

        if (res.status >= 400) {
          const errorMessage = data.message || JSON.stringify(data.message);
          throw new Error(errorMessage);
        }
        setConversations(data.data.filteredusers);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    getConversations();
  }, []);

  return { loading, conversations };
}

export default useGetConversations;
