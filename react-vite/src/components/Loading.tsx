import { RotatingLines } from "react-loader-spinner";
import React from "react";

const containerStyle : React.CSSProperties = {
    display: "flex",
    justifyContent: "center", 
    alignItems: "center",     
    height: "100vh",          
    width: "100vw",           
    position: "fixed",        
    top: 0,
    left: 0,
};

function LoadingSpinner() {
  return (
    <div style={containerStyle}>
          <RotatingLines
            strokeColor="grey"
            strokeWidth="5"
            animationDuration="0.75"
            width="96"
            visible={true}
          />
    </div>
  )
}



export default LoadingSpinner;