'use client'; // Todo: Is this needed?

import React, { MutableRefObject, useEffect, useState } from "react";
import { useRef } from 'react';
import { CheckBoxOutlineBlank, CheckBox, Delete, Add, Edit, Close, Check } from '@mui/icons-material';
import {IconButton, Snackbar} from "@mui/material";

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

function ToDoList() {
  const newTaskName: MutableRefObject<any> = useRef(null);
  const selectCompleted: MutableRefObject<any> = useRef(null);

  const [viewingCompleted, setViewingCompleted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  // States to manage the snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  async function updateTasksView() {
    const res = await fetch(`/api/getToDo?completed=${viewingCompleted}`);
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
        completed: false
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
      <div className="todoList">
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
  return (
    <div className="App">
      <header className="homeHeader">
        To do List
      </header>
      {ToDoList()}
    </div>
  );
}
