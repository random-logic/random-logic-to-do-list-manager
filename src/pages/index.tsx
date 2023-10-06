'use client'; // Todo: Is this needed?

import React, { MutableRefObject, useEffect, useState } from "react";
import { useRef } from 'react';

type Task = {
  _id: string,
  name: string,
  completed: boolean
};

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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded p-4 shadow-md">
        <select
          ref={selectCompleted}
          name="filter by"
          className="mb-4 p-2 border border-gray-300 rounded"
          onChange={() => toggleCompleted(selectCompleted.current.value === 'completed')}
        >
          <option value="to do">To do</option>
          <option value="completed">Completed</option>
        </select>

        <ul>
          {tasks.map(task =>
            <li key={task._id} className="flex items-center justify-between border-b border-gray-300 py-2">
              <button
                onClick={() => updateTaskCompleted(task._id, !task.completed)}
                className={`px-2 py-1 ${task.completed ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'} rounded`}
              >
                Toggle Completed
              </button>
              {task.name}
              <button
                onClick={() => deleteTask(task._id)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </li>
          )}
        </ul>
        <input
          type="text"
          ref={newTaskName}
          className="mt-4 p-2 border border-gray-300 rounded"
        ></input>
        <button
          onClick={() => addNewTask(newTaskName.current.value)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add New Task
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="App">
      <header className="App-header text-2xl font-bold bg-blue-500 text-white p-4">
        To do List
      </header>
      {ToDoList()}
    </div>
  );
}
