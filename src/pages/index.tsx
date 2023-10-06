'use client'; // Todo: Is this needed?

import React, {MutableRefObject, useEffect, useState} from "react";
import { useRef } from 'react';

type Task = {
  _id: string,
  name: string,
  completed: boolean
};

function ToDoList() {
  const newTaskName : MutableRefObject<any> = useRef(null);
  const selectCompleted : MutableRefObject<any> = useRef(null);

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

  async function updateTaskName(_id: string, newName: string) {
    _id = _id.trim();
    newName = newName.trim();

    await fetch('/api/updToDo', {
      method: 'PATCH',
      body: JSON.stringify({
        id: _id,
        set: {
          name: newName
        }
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

    if (name == '') {
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
    <div className="ToDoList">
      <select ref={selectCompleted} name="filter by"
              onChange={() => toggleCompleted(selectCompleted.current.value == 'completed')}>
        <option value="to do">To do</option>
        <option value="completed">Completed</option>
      </select>

      <ul>
        {tasks.map(task =>
          <li key={task._id}>
            {task.name}
            <button onClick={() => updateTaskCompleted(task._id, !task.completed)}>Toggle Completed</button>
            <button onClick={() => deleteTask(task._id)}>Delete</button>
          </li>
        )}
      </ul>
      <input type="text" ref={newTaskName}></input>
      <button onClick={() => addNewTask(newTaskName.current.value)}>Add New Task</button>
    </div>
  )
}

export default function Home() {
  return (
    <div className="App">
      <header className="App-header">
        To do List
      </header>
      {ToDoList()}
    </div>
  );
}