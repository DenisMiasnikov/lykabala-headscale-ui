import React, {useState} from "react";
import styles from "./avatar.module.css"

export const Avatar = ({src}:{src: string}) => {
  const [imgSrc, setImgSrc] = useState(src.startsWith('http') ? src : `/api/internal/image?key=${encodeURIComponent(src)}`);
  return (
    <img
      src={imgSrc}
      alt="Avatar"
      className={styles.avatar}
      onError={() => setImgSrc('/emptyPhoto.png')}
    />
  )
}
