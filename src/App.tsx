import React from 'react';
import { useState, useRef, useEffect } from 'react'
import { dungeon } from "../src/assets/mock"

import './App.css';

const themes = [
  { screen: 'black', font: '#7ef25e', border: '0px', size: '20px', fam: 'ModernDOS8x16' },
  { screen: 'black', font: 'white', border: '0px', size: '20px', fam: 'ModernDOS8x16' },
  { screen: '#362a84', font: '#867ade', border: '15px', size: '25px', fam: 'Commodore-64-v6.3' },
  { screen: 'white', font: 'black', border: '0px', size: '20px', fam: 'ModernDOS8x16' }
]

const emptyLine = ''

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const currentDate = new Date();
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);

  const [theme, setTheme] = useState(0)
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [dungeonObj, setDungeonObj] = useState(dungeon)
  const [{ inventory, location }, setPlayer] = useState({ inventory: ['clothes'], location: 'west room' })
  const [action, setAction] = useState('')
  const [actionRes, setActionRes] = useState(['Welcome to Simple Text Dungeon!'])
  const [room, setRoom] = useState(dungeonObj[0])

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;

    if (running) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!running) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (time === 10) {
      describe(room)
    }
  }, [time]);

  function handleKeyPress(e: any) {
    if (e.key === 'Enter') {      
      setActionRes(oldArray => [...oldArray, `> ${action}`]);
      getOneCommand()
      setAction('')
    }
  }

  const rotateTheme = (param = '') => {
    if (theme < themes.length - 1) {
      setTheme(theme + 1)
    } else {
      setTheme(0)
    }
  }

  const clickAction = () => {
    if (inputRef.current != null) {
      inputRef.current.focus();
    }
  }

  function commandSplit(str: string) {
    var parts = str.split(" ");
    var command = parts.shift();
    var object = parts.join(' ');
    return [command, object];
  }

  function endGame() {
    setRunning(false)
    var newActionRes: string[] = [];
    newActionRes.push(`Congratulations, you escaped the Dungeon!`)
    newActionRes.push(`Total Time: ${("0" + Math.floor((time / 60000) % 60)).slice(-2)}:${("0" + Math.floor((time / 1000) % 60)).slice(-2)}:${("0" + ((time / 10) % 100)).slice(-2)}`)
    newActionRes.push(`You scored ${score} points`)
    setActionRes(oldArray => [...oldArray, ...newActionRes]);
  }

  function tryToUse(obj: string) {
    var newActionRes = ''
    const matches = inventory.find(s => s.includes(obj));
    if (matches) {
      switch (matches) {
        case 'golden key':
          if (location === 'east room') {
            newActionRes = `You use ${matches} on the gate`
            setActionRes(oldArray => [...oldArray, newActionRes]);
            endGame()
          } else {
            newActionRes = `You can't use ${matches} here`
          }
          // location === 'east room' ? true : false
          break;
        default:
          newActionRes = `You can't use ${obj} here`
          setActionRes(oldArray => [...oldArray, newActionRes]);
          break;
      }
    } else if (obj === 'gate') {
      // east room
      let newActionRes = ''
      if (location === 'east room') {
        newActionRes += 'The gate is locked'
      } else {
        newActionRes += 'There is no gate in this room'
      }
      setActionRes(oldArray => [...oldArray, newActionRes]);
    } else {
      newActionRes = `You don't have ${obj} in your inventory`
      setActionRes(oldArray => [...oldArray, newActionRes]);
    }


  }

  function tryToMove(room: any, direction: string) {

    if (room.exits[direction]) {
      setMoves(moves + 1)
      setPlayer((prevState) => ({ ...prevState, location: room.exits[direction] }));
      let updateLocation = dungeonObj.filter((item) => item.short_description.includes(room.exits[direction]))
      setRoom(updateLocation[0]);
      describe(updateLocation[0]);
    } else {
      setActionRes(oldArray => [...oldArray, "You cannot go that way"]);
    }
  }

  function printInventory() {
    var newActionRes: string[] = [];
    newActionRes.push("You are carrying: ")
    if (inventory.length > 0) {
      inventory.forEach(function (item) {
        newActionRes.push(item)
      });
    } else {
      newActionRes.push(`Nothing`)
    }
    setActionRes(oldArray => [...oldArray, ...newActionRes]);
  }

  function describe(room: any, desc = 'short_description') {
    var newActionRes: string[] = []
    newActionRes.push(`You are in ${room[desc]}`)
    //long_description
    if (desc === 'long_description') {
      var exits = Object.keys(room.exits);
      if (exits.length > 1) {
        var last_exit = exits.pop();
        newActionRes.push(`There are exits to the ${exits.join(', ')} and ${last_exit}`)
      } else {
        newActionRes.push(`There is an exit to the ${exits[0]}`)
      }
      room['contents'].map((item: string) => newActionRes.push(`There is a  ${item} here`))
    }

    newActionRes.push(emptyLine)
    setActionRes(oldArray => [...oldArray, ...newActionRes]);
  }

  function getLocation(locationName: string) {
    let getLoc = 0
    switch (location) {
      case 'west room':
        getLoc = 0
        break;
      case 'east room':
        getLoc = 1
        break;
      case 'centre room':
        getLoc = 2
        break;
      default:
        break;
    }
    return getLoc
  }

  function getOneCommand() {
    let getLoc = getLocation(location)
    let command = commandSplit(action);
    let verb = command[0];
    let obj = command[1] ? command[1] : '';
    switch (verb) {
      case 'inventory':
        printInventory()
        break;
      case 'look':
        describe(room, 'long_description')
        break;
      case 'get':
      case 'take':
        setMoves(moves + 1)
        var newActionRes: string[] = []
        var updateDungeon = [...dungeonObj] as any;
        var itemUpdate = [...inventory] as any;
        let matchesCommand = obj.search('all');
        if (matchesCommand === 0) {
          if (room['contents'].length > 0) {
            setScore(score + (room.contents.length * 10))
            // eslint-disable-next-line array-callback-return
            room.contents.map((item: string) => {
              itemUpdate.push(item)
              newActionRes.push(`You pick up the ${item}`)
              updateDungeon[getLoc]['contents'] = updateDungeon[getLoc]['contents'].filter((e: string) => e !== item);
            })
            setDungeonObj(updateDungeon)
            setPlayer((prevState) => ({ ...prevState, inventory: itemUpdate }));
          } else {
            newActionRes.push(`There is nothing to take!`)
          }
        } else {
          // eslint-disable-next-line array-callback-return
          room.contents.map((item: string) => {
            let matches = item.search(obj);
            if (matches === 0) {
              newActionRes.push(`You pick up the ${item}`)
              itemUpdate.push(item)
              setScore(score + 10)
              updateDungeon[getLoc]['contents'] = updateDungeon[getLoc]['contents'].filter((e: string) => e !== item);
            }
            setDungeonObj(updateDungeon)
            setPlayer((prevState) => ({ ...prevState, inventory: itemUpdate }));
          })
        }
        newActionRes.push(emptyLine)
        setActionRes(oldArray => [...oldArray, ...newActionRes]);
        break;
      case 'east':
      case 'west':
      case 'north':
      case 'south':
      case 'up':
      case 'down':
      case 'in':
      case 'out':
        tryToMove(room, verb);
        break;
      case 'go':
      case 'walk':
        tryToMove(room, obj ? obj : '');
        break;
      case 'change':
        rotateTheme(obj)
        break;
      case 'clear':
        setActionRes([])
        break;
      case 'use':
        setMoves(moves + 1)
        tryToUse(obj);
        break;
      case 'open':
        setMoves(moves + 1)
        tryToUse(obj);
        break;
      default:
        if (action) setActionRes(oldArray => [...oldArray, `You can't ${action}`]);
        break;
    }
  }
  return (
    <div className="App" onClick={clickAction} style={{ background: themes[theme].screen, color: themes[theme].font, fontSize: themes[theme].size, border: `${themes[theme].border} solid ${themes[theme].font}`, padding: 0, margin: 0, overflowX: 'hidden' }} >
      <div className='header-game' style={{ color: `${themes[theme].screen}`, backgroundColor: `${themes[theme].font}` }}>
        <p>Adventure Game</p>
        <p>Score: {score} Moves: {moves}</p>
      </div>

      <div className="container">
        <p>{`Simple text adventure - by Eduardo Issamu Nakamura - ${currentDate.getFullYear()}`}</p>
        <p style={{ paddingBottom: '20px' }}>{`Original project by Dethe Elza`} <a style={{ color: themes[theme].font }} href="https://hackmd.io/@dethe/r1eH-CMdS#Goal">https://hackmd.io/@dethe/r1eH-CMdS#Goal</a></p>

        {actionRes.slice(-20).map((row, index) => (
          <p key={index} style={{ margin: '10px 0 10px' }}>{row}</p>
        ))}

        {running && (
          <>
            <p>{'> '}{action}<span className='anim'>_</span></p>
            <input autoComplete="off" style={{ opacity: 0 }} ref={inputRef} autoFocus type="text" onKeyPress={(e) => handleKeyPress(e)} name="action" id="action" onChange={e => setAction(e.target.value)} value={action} />
          </>
        )}
      </div>


    </div>
  );
}

export default App;
