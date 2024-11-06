import React, { useState, useEffect } from 'react';

const CorsiTest = () => {
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(3);
  const [attempts, setAttempts] = useState(0);
  const [gameStatus, setGameStatus] = useState('ready');
  const [isReverse, setIsReverse] = useState(false);
  const [errorLog, setErrorLog] = useState({});
  const [blockPositions, setBlockPositions] = useState([]);
  
  const maxBlocks = 9;
  const attemptsPerLevel = 3;
  const boardSize = 240;
  const blockSize = 32;
  const margin = 20;

  const generateBlockPositions = () => {
    const positions = [];
    const minDistance = 40;
    
    for (let i = 0; i < 9; i++) {
      let newPosition;
      let isValidPosition;
      
      do {
        isValidPosition = true;
        newPosition = {
          id: i,
          x: margin + Math.random() * (boardSize - blockSize - 2 * margin),
          y: margin + Math.random() * (boardSize - blockSize - 2 * margin)
        };
        
        for (const position of positions) {
          const distance = Math.sqrt(
            Math.pow(newPosition.x - position.x, 2) + 
            Math.pow(newPosition.y - position.y, 2)
          );
          if (distance < minDistance) {
            isValidPosition = false;
            break;
          }
        }
      } while (!isValidPosition);
      
      positions.push(newPosition);
    }
    return positions;
  };

  // 改回不重複的序列生成
  const generateSequence = () => {
    const newSequence = [];
    const available = Array.from({ length: 9 }, (_, i) => i);
    
    for (let i = 0; i < currentLevel; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      newSequence.push(available[randomIndex]);
      available.splice(randomIndex, 1);
    }
    
    return isReverse ? newSequence.reverse() : newSequence;
  };

  const playSequence = async () => {
    setGameStatus('playing');
    setUserSequence([]);
    setBlockPositions(generateBlockPositions());
    const newSequence = generateSequence();
    setSequence(newSequence);
    
    for (let i = 0; i < newSequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsPlaying(newSequence[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsPlaying(-1);
    }
    
    setGameStatus('input');
  };

  const handleBlockClick = (id) => {
    if (gameStatus !== 'input') return;
    
    const newUserSequence = [...userSequence, id];
    setUserSequence(newUserSequence);
    
    if (newUserSequence.length === sequence.length) {
      checkSequence(newUserSequence);
    }
  };

  const checkSequence = (userSeq) => {
    const isCorrect = userSeq.every((block, index) => block === sequence[index]);
    
    if (!isCorrect) {
      setErrorLog(prev => ({
        ...prev,
        [currentLevel]: (prev[currentLevel] || 0) + 1
      }));
    }

    setAttempts(prev => prev + 1);

    if (attempts + 1 >= attemptsPerLevel) {
      if (currentLevel < maxBlocks) {
        setCurrentLevel(prev => prev + 1);
        setAttempts(0);
      } else {
        setGameStatus('finished');
        return;
      }
    }
    
    setGameStatus('ready');
  };

  const resetGame = () => {
    setCurrentLevel(3);
    setAttempts(0);
    setSequence([]);
    setUserSequence([]);
    setGameStatus('ready');
    setErrorLog({});
    setBlockPositions(generateBlockPositions());
  };

  const toggleMode = () => {
    setIsReverse(!isReverse);
  };

  useEffect(() => {
    setBlockPositions(generateBlockPositions());
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">🧠 Corsi記憶力測試</h1>
      </div>

      <div className="text-center mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600">當前等級</div>
            <div className="text-2xl font-bold text-blue-700">{currentLevel}個方塊</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600">當前嘗試</div>
            <div className="text-2xl font-bold text-green-700">{attempts + 1}/{attemptsPerLevel}</div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-4">
          <button 
            onClick={toggleMode}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
          >
            {isReverse ? '倒序模式' : '順序模式'}
          </button>
          <button 
            onClick={resetGame}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
          >
            重新開始
          </button>
        </div>

        {gameStatus === 'ready' && (
          <button 
            onClick={playSequence}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
          >
            開始
          </button>
        )}
        
        {gameStatus === 'finished' && (
          <div className="space-y-4">
            <div className="text-lg font-semibold">測試完成！</div>
            <button 
              onClick={resetGame}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
            >
              重新開始
            </button>
          </div>
        )}
      </div>
      
      <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-lg">
        {blockPositions.map(block => (
          <div
            key={block.id}
            onClick={() => handleBlockClick(block.id)}
            className={`
              absolute w-8 h-8 rounded-lg cursor-pointer
              transition-all duration-200
              hover:scale-110
              ${isPlaying === block.id ? 'bg-blue-500 scale-110' : 'bg-blue-200'}
              ${userSequence.includes(block.id) && gameStatus === 'input' ? 'bg-green-200' : ''}
              ${gameStatus === 'input' ? 'hover:bg-blue-300' : ''}
            `}
            style={{
              left: block.x,
              top: block.y,
              boxShadow: isPlaying === block.id ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'
            }}
          />
        ))}
      </div>
      
      <div className="text-center mt-6 h-6 text-gray-600">
        {gameStatus === 'playing' && (
          <div className="animate-pulse">
            請記住方塊{isReverse ? '倒序' : '順序'}亮起的順序
          </div>
        )}
        {gameStatus === 'input' && (
          <div>
            請按照記憶中的{isReverse ? '倒序' : '順序'}點擊方塊 
            ({userSequence.length}/{sequence.length})
          </div>
        )}
      </div>

      {Object.keys(errorLog).length > 0 && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <div className="text-red-600 font-medium mb-2">錯誤記錄：</div>
          {Object.entries(errorLog).map(([level, count]) => (
            <div key={level} className="text-sm text-red-500">
              {level}個方塊：{count}次錯誤
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CorsiTest;