import {useState, useEffect} from 'react';



//
export const useScreenSize = () => {
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

  return {height: screenSize.height, width: screenSize.width}
};
