export const generateId = () => Math.random().toString(36).substring(2, 15)

export function saveUserToStorage(data: any) {
  try {
    localStorage.setItem('party-hub-user', JSON.stringify(data))
  } catch {}
}

export function loadUserFromStorage() {
  try {
    const data = localStorage.getItem('party-hub-user')
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Error parsing user data', e)
  }
  return null
}

export function handleAuthFromUrl() {
  if (typeof window === 'undefined') return

  const searchParams = new URLSearchParams(window.location.search);
  const authDataParam = searchParams.get('auth_data');
  if (authDataParam) {
    try {
      const authDataString = atob(authDataParam);
      const authData = JSON.parse(authDataString);
      
      const oldDataRaw = window.localStorage.getItem('party-hub-user');
      let roomId = '';
      if (oldDataRaw) {
        const oldData = JSON.parse(oldDataRaw);
        roomId = oldData.roomId || '';
      }
      if (roomId) authData.roomId = roomId;
      
      window.localStorage.setItem('party-hub-user', JSON.stringify(authData));
      
      // Limpiar la URL para que no quede el token ahí feo
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch(e) {
      console.error('Failed to parse auth data from URL', e);
    }
  }
}
