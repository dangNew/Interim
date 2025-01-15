import React, { useState } from 'react';
import './BlogrollApp.css';

const BlogrollApp = () => {
  const [blogs, setBlogs] = useState([
    { author: 'Michael', title: 'Michael\'s Blog', url: 'http://michaelsawesomeblog.com' }
  ]);
  const [newBlog, setNewBlog] = useState({ author: '', title: '', url: '' });
  const [editIndex, setEditIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBlog({ ...newBlog, [name]: value });
  };

  const addBlog = () => {
    if (editIndex !== null) {
      const updatedBlogs = blogs.map((blog, index) =>
        index === editIndex ? { ...blog, ...newBlog } : blog
      );
      setBlogs(updatedBlogs);
      setEditIndex(null);
    } else {
      setBlogs([...blogs, newBlog]);
    }
    setNewBlog({ author: '', title: '', url: '' });
  };

  const editBlog = (index) => {
    setNewBlog(blogs[index]);
    setEditIndex(index);
  };

  const deleteBlog = (index) => {
    const updatedBlogs = blogs.filter((_, i) => i !== index);
    setBlogs(updatedBlogs);
  };

  return (
    <div className="blogroll-app">
      <h1>Backbone Blogroll App</h1>
      <div className="form-container">
        <input
          type="text"
          name="author"
          value={newBlog.author}
          onChange={handleInputChange}
          placeholder="Author"
        />
        <input
          type="text"
          name="title"
          value={newBlog.title}
          onChange={handleInputChange}
          placeholder="Title"
        />
        <input
          type="url"
          name="url"
          value={newBlog.url}
          onChange={handleInputChange}
          placeholder="URL"
        />
        <button onClick={addBlog}>{editIndex !== null ? 'Update Blog' : 'Add Blog'}</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Author</th>
            <th>Title</th>
            <th>URL</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog, index) => (
            <tr key={index}>
              <td>{blog.author}</td>
              <td>{blog.title}</td>
              <td><a href={blog.url} target="_blank" rel="noopener noreferrer">{blog.url}</a></td>
              <td>
                <button onClick={() => editBlog(index)}>Edit</button>
                <button onClick={() => deleteBlog(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlogrollApp;
