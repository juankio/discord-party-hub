<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </div>
</template>

<style>
/* Estilos base Pro Max */
body {
  background-color: #1e1f22; /* Discord dark */
  color: #f2f3f5;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #1e1f22; 
}
::-webkit-scrollbar-thumb {
  background: #2b2d31; 
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #383a40; 
}

/* Glow helpers */
.neon-glow {
  box-shadow: 0 0 15px rgba(88, 101, 242, 0.5);
}
</style>
