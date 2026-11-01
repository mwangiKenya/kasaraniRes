//const mainUrl = 'https://python-back-2.onrender.com/api/';
const mainUrl = 'http://127.0.0.1:8000/api/';
export default mainUrl;
export const authFetch = async (path, options = {}) => {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${mainUrl}${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      Authorization: `Token ${localStorage.getItem("token")}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/";
  }
  return res;
};

export const downloadFile = async (path, name) => {
  const res = await authFetch(path);
  if (!res.ok) return false;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
  return true;
};