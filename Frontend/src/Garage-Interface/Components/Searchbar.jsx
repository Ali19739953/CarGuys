import React from "react";
import styles from "../Modules/Searchbar.module.css";

function Searchbar() {
  return (
    <div className={styles.searchContainer}>
      <input type="text" placeholder="Search..." className={styles.searchBar} />
    </div>
  );
}

export default Searchbar;
