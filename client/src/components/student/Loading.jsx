import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Loading= () => {
  const {path} = useParams()
const navigate = useNavigate()
useEffect(() => {
  if(path){
    const timer = setTimeout(() => {
      navigate(`/${path}`)
    }, 5000);
    return () => clearTimeout(timer)
  }
} , [])
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-t-4 border-gray-300 rounded-full animate-spin border-t-blue-500"></div>
    </div>
  );
};

export default Loading;