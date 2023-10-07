'use client'; // Todo: Is this needed?

import React, { MutableRefObject, useEffect, useState } from "react";
import { useRef } from 'react';
import { CheckBoxOutlineBlank, CheckBox, Delete, Add, Edit, Close, Check } from '@mui/icons-material';
import {IconButton, Snackbar} from "@mui/material";

import {getAuth, signInWithPopup, GoogleAuthProvider, signOut} from "firebase/auth";
import { initializeApp } from 'firebase/app';

type Task = {
  _id: string,
  name: string,
  completed: boolean
};

function TaskView(props: { displaySnackbar: (msg: string) => void, task: Task, onClickCheckbox: () => Promise<void>, onClickDel: () => Promise<void> }) {
  const editField : MutableRefObject<any> = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(props.task.name);

  async function updateTaskName(newName: string) {
    newName = newName.trim();

    const res = await fetch('/api/updToDo', {
      method: 'PATCH',
      body: JSON.stringify({
        id: props.task._id,
        set: {
          name: newName
        }
      })
    });

    if (res.status != 200) {
      props.displaySnackbar(`${res.status} ${res.statusText}`);
    }
    else {
      setName(newName);
      setIsEditing(false);
      props.displaySnackbar(`Task edited successfully`);
    }
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function startEditing() {
    setIsEditing(true);
  }

  return <li className="taskView">
    <button>
      {
        props.task.completed ?
          <CheckBox onClick={props.onClickCheckbox} className="checkBox" /> :
          <CheckBoxOutlineBlank onClick={props.onClickCheckbox} className="checkBox" />
      }
    </button>
    {isEditing ? <input ref={editField} type="text" className="textBox" placeholder={name}></input> : name}
    <section>
      {isEditing ?
        <>
          <button onClick={() => updateTaskName(editField.current.value)}>
            <Check />
          </button>
          <button onClick={cancelEdit}>
            <Close />
          </button>
        </> :
        <>
          <button
            onClick={startEditing}
          >
            <Edit />
          </button>
          <button
            onClick={props.onClickDel}
          >
            <Delete/>
          </button>
        </>
      }
    </section>
  </li>;
}

function ToDoList(props : {uuid : string}) {
  const uuid = props.uuid;

  const newTaskName: MutableRefObject<any> = useRef(null);
  const selectCompleted: MutableRefObject<any> = useRef(null);

  const [viewingCompleted, setViewingCompleted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  // States to manage the snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  async function updateTasksView() {
    const res = await fetch(`/api/getToDo?completed=${viewingCompleted}&uuid=${uuid}`);
    const data = await res.json();
    setTasks(data);
  }

  async function deleteTask(_id: string) {
    const res = await fetch('/api/delToDo', {
      method: 'DELETE',
      body: JSON.stringify({
        id: _id
      })
    });

    if (res.status != 200) {
      displaySnackbar(`${res.status} ${res.statusText}`);
    }
    else {
      await updateTasksView();
      displaySnackbar("Tasks deleted successfully!");
    }
  }

  async function updateTaskCompleted(_id: string, completed: boolean) {
    const res = await fetch('/api/updToDo', {
      method: 'PATCH',
      body: JSON.stringify({
        id: _id,
        set: {
          completed: completed
        }
      })
    });

    if (res.status != 200) {
      displaySnackbar(`${res.status} ${res.statusText}`);
    }
    else {
      await updateTasksView();
      displaySnackbar("Tasks updated successfully!");
    }
  }

  async function addNewTask(name: string) {
    name = name.trim();

    if (name === '') {
      displaySnackbar("Invalid task name");
      return;
    }

    const res = await fetch('/api/addToDo', {
      method: 'POST',
      body: JSON.stringify([{
        name: name,
        completed: false,
        uuid: uuid
      }])
    });

    if (res.status != 200) {
      displaySnackbar(`${res.status} ${res.statusText}`);
    }
    else {
      await updateTasksView();
      displaySnackbar("Tasks added successfully!");
    }
  }

  async function toggleCompleted(completed: boolean) {
    setViewingCompleted(completed);
  }

  function displaySnackbar(msg: string) {
    console.log(msg);
    setSnackbarMessage(msg);
    setSnackbarOpen(true);
  }

  useEffect(() => {
    updateTasksView().catch(console.error);
  }, [viewingCompleted]);

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="backGround">
      <div className="whiteFloatyThingInTheCenter">
        <select
          ref={selectCompleted}
          className="filterBy"
          onChange={() => toggleCompleted(selectCompleted.current.value === 'completed')}
        >
          <option value="to do">To do</option>
          <option value="completed">Completed</option>
        </select>

        <ul>
          {tasks.map(task =>
            <TaskView
              displaySnackbar={displaySnackbar}
              key={task._id}
              task={task}
              onClickCheckbox={() => updateTaskCompleted(task._id, !task.completed)}
              onClickDel={() => deleteTask(task._id)}
            />
          )}
        </ul>
        {!viewingCompleted ?
          <>
            <input
              type="text"
              ref={newTaskName}
              className="textBox"
            />
            <button
              onClick={() => addNewTask(newTaskName.current.value)}
              className="addNewTask"
            >
              <Add />
            </button>
          </>
          : <></>
        }
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // Adjust the duration as needed
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <Close fontSize="small" />
            </IconButton>
          </>
        }
      />
    </div>
  )
}

export default function Home() {
  const [isSignedIn, setSignedIn] = useState(false);
  const [uuid, setUuid] = useState('');

  const provider = new GoogleAuthProvider();
  const firebaseConfig = {
    apiKey: "AIzaSyCbXfTcvVh3pVIyyuwcZc51BC-92nL1S3g",
    authDomain: "to-do-list-manager-efc56.firebaseapp.com",
    projectId: "to-do-list-manager-efc56",
    storageBucket: "to-do-list-manager-efc56.appspot.com",
    messagingSenderId: "459576284129",
    appId: "1:459576284129:web:265e9699c61cc00c41b8a0",
    measurementId: "G-4VGR2DR2XW"
  };
  const app = initializeApp(firebaseConfig);
  const auth = getAuth();

  async function homeSignIn() {
    try {
      const result = await signInWithPopup(auth, provider)
      // This gives you a Google Access Token. You can use it to access the Google API.
      //const credential = GoogleAuthProvider.credentialFromResult(result);
      //const token = credential?.accessToken;
      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      // ...

      setUuid(user.uid);
      setSignedIn(true);
    }
    catch(error : any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`${errorCode} ${errorMessage}`);
    }
  }

  async function homeSignOut() {
    try {
      await signOut(auth);
      setSignedIn(false);
      setUuid("");
      alert('Sign out success');
    }
    catch (e : any) {
      alert(e.toString());
    }
  }

  return (
    <div className="App">
      <header className="homeHeader flex justify-between">
        <span>To do List</span>
        <button onClick={!isSignedIn ? homeSignIn : homeSignOut}>{!isSignedIn ? "Sign in" : "Sign out"}</button>
      </header>
      {isSignedIn ? <ToDoList uuid={uuid} />
        : <div className="backGround">
            <div className="whiteFloatyThingInTheCenter">
              Please sign in (using Google) on top right corner
            </div>
          </div>
      }
    </div>
  );
}
