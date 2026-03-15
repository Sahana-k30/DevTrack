import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function GithubAnalytics() {

  const username = localStorage.getItem("githubUsername");

  const [data, setData] = useState(null);

  useEffect(() => {

    const fetchAnalytics = async () => {

      try {

        const res = await axios.get(
          `http://localhost:5000/api/github/analytics/${username}`
        );

        setData(res.data);

      } catch (error) {
        console.error(error);
      }
    };

    fetchAnalytics();

  }, [username]);

  if (!data) return <h2>Loading...</h2>;

  return (

    <div className="flex h-screen">

      <Sidebar />

      <div className="flex-1 p-8">

        <img src={data.avatar} width="100" />

        <h2>{data.username}</h2>

        <p>Followers: {data.followers}</p>
        <p>Following: {data.following}</p>
        <p>Public Repositories: {data.publicRepos}</p>
        <p>Total Stars: {data.totalStars}</p>

        <h3 className="mt-4 font-bold">Languages Used</h3>

        <ul>

          {Object.entries(data.languages).map(([lang, count]) => (

            <li key={lang}>
              {lang} : {count}
            </li>

          ))}

        </ul>

        <a
          href={data.profile}
          target="_blank"
          className="text-blue-500"
        >
          View GitHub Profile
        </a>

      </div>

    </div>

  );
}