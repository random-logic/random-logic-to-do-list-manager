'use client'; // Todo: Is this needed?

import React, { MutableRefObject, useEffect, useState } from "react";
import { useRef } from 'react';
import { CheckBoxOutlineBlank, CheckBox, Delete, Add, Edit, Close, Check } from '@mui/icons-material';

type Task = {
  _id: string,
  name: string,
  completed: boolean
};

function TaskView(props: { task: Task, onClickCheckbox: () => Promise<void>, onClickDel: () => Promise<void> }) {
  const editField : MutableRefObject<any> = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(props.task.name);

  async function updateTaskName(newName: string) {
    newName = newName.trim();

    await fetch('/api/updToDo', {
      method: 'PATCH',
      body: JSON.stringify({
        id: props.task._id,
        set: {
          name: newName
        }
      })
    });

    setName(newName);
    setIsEditing(false);
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

  async function updateTasksView() {
    const res = await fetch(`/api/getToDo?completed=${viewingCompleted}`);
    const data = await res.json();
    setTasks(data);
  }

  async function deleteTask(_id: string) {
    await fetch('/api/delToDo', {
      method: 'DELETE',
      body: JSON.stringify({
        id: _id
      })
    });

    await updateTasksView();
  }

  async function updateTaskCompleted(_id: string, completed: boolean) {
    _id = _id.trim();

    await fetch('/api/updToDo', {
      method: 'PATCH',
      body: JSON.stringify({
        id: _id,
        set: {
          completed: completed
        }
      })
    });

    await updateTasksView();
  }

  async function addNewTask(name: string) {
    name = name.trim();

    if (name === '') {
      return;
    }

    await fetch('/api/addToDo', {
      method: 'POST',
      body: JSON.stringify([{
        name: name,
        completed: false
      }])
    });

    await updateTasksView();
  }

  async function toggleCompleted(completed: boolean) {
    setViewingCompleted(completed);
  }

  useEffect(() => {
    updateTasksView().catch(console.error);
  }, [viewingCompleted]);

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
            <TaskView key={task._id} task={task} onClickCheckbox={() => updateTaskCompleted(task._id, !task.completed)}
                      onClickDel={() => deleteTask(task._id)}/>
          )}
        </ul>
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
      </div>
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
