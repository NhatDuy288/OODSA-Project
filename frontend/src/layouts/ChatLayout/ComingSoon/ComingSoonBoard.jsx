import React from 'react';

const ComingSoonBoard = ({ title = "Tính năng đang phát triển" }) => {
  return (
    <div style={styles.container}>
      <img 
        src="https://cdn-icons-png.flaticon.com/512/1067/1067357.png" 
        alt="construction" 
        style={styles.image}
      />
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.text}>
        Chức năng này đang được phát triển.<br/>
        Vui lòng quay lại sau bạn nhé!
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: '#fff', 
    textAlign: 'center',
    padding: '20px',
    color: '#555'
  },
  image: {
    width: '120px',
    marginBottom: '20px',
    opacity: 0.7
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#333'
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.5',
    color: '#666'
  }
};

export default ComingSoonBoard;