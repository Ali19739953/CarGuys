import ChatListClientMessenger from "./chatList/ChatList"
import styles from "./list.module.css"
import Userinfo from "./userInfo/Userinfo"

const List = () => {
  return (
    <section className={styles.ClientMessengerlist}>
      <div className={styles.ClientMessengerlist_UserInfo}>
      <Userinfo/>
      </div>
      <div className={styles.ClientMessengerlist_List}>
      <ChatListClientMessenger/>
      </div>
    </section>
  )
}

export default List