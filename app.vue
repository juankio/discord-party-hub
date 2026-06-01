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
  background-color: #0A0A0A !important; /* Discord dark */
  background-image: url('/doodles.svg');
  background-repeat: repeat;
  background-attachment: fixed;
  color: #f2f3f5;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #0A0A0A; 
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
