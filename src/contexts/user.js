import { createContext, useState } from "react";

export const GitHubUserContext = createContext({});

export default function GitHubUserProvider({ children }) {
  const [githubUser, setGithubUser] = useState("");  

  return (
    <GitHubUserContext.Provider value={{githubUser, setGithubUser}}>
      {children}
    </GitHubUserContext.Provider>
  )
}
