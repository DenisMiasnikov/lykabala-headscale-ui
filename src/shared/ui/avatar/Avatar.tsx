import React, {useState} from "react";
import styles from "./avatar.module.css"

export const Avatar = ({src, size = 'small'}:{src: string, size?: 'small' | 'large'}) => {
  const [imgSrc, setImgSrc] = useState(src.startsWith('http') ? src : `/api/internal/image?key=${encodeURIComponent(src)}`);
  return (
    <img
      src={imgSrc}
      alt="Avatar"
      className={`${styles.avatar} ${styles[`avatar__${size}`]}`}
      onError={() => setImgSrc('/emptyPhoto.png')}
    />
  )
}
