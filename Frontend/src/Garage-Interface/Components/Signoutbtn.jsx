import styles from "../Modules/signout-btn.module.css";

function Signoutbtn() {
  return (
    <button className={styles.signOutBtn}>
      <img src="/icon/logout.png" alt="logout" className={styles.logoutImg} />
      Sign Out
    </button>
  );
}

export default Signoutbtn;
