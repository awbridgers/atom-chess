import {useState, useEffect} from 'react';



//
export const useSquareSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const handleResize = ()=> setScreenSize({
      height: window.innerHeight,
      width: window.innerWidth,
    })
    window.addEventListener('resize', handleResize)
    return ()=>window.removeEventListener('resize', handleResize)
  },[]);

  return Math.max(Math.min(screenSize.width/17, screenSize.height/10), 60)
};
