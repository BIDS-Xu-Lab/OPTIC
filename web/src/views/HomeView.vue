<template>
    <div class="container">
        <img src="../../public/images/logo_large.png" alt="OPTIC" class="home-logo" style="width: 25rem;"/>
        <h1 class="home-title">Broaden reach. Keep trial standard.</h1>
        <p class="mb-4 text-xl">Welcome to OPTIC!</p>
        
        <div class="list-container w-full max-w-6xl">
            <!-- Item 1 -->
            <div class="list-item flex flex-row items-center gap-2">
                <div class="icon-box">
                    <font-awesome-icon icon="eye" class="text-2xl text-[#146082]" />
                </div>
                <div class="text-box flex-1">
                    <p>OPTIC stands for <i>OPtimized Trial design via Conditional Independence Test</i>. It uses real-world data to identify a more <b>representative</b> eligible population with an option to maintain trial-comparable <b>safety</b>.</p>
                </div>
            </div>

            <!-- Item 2 -->
            <div class="list-item flex flex-row items-center gap-2">
                <div class="icon-box">
                    <font-awesome-icon icon="glasses" class="text-2xl text-[#146082]" />
                </div>
                <div class="text-box flex-1">
                    <p>OPTIC improves clinical <b>generalizability</b>, operational <b>feasibility</b>, and statistical <b>efficiency</b>.</p>
                </div>
            </div>

            <!-- Item 3 -->
            <div class="list-item flex flex-row items-center gap-2">
                <div class="icon-box">
                    <font-awesome-icon icon="shoe-prints" class="text-2xl text-[#146082]" />
                </div>
                <div class="text-box flex-1">
                    <p>Start your journey now!</p>
                </div>
            </div>
        </div>
        
        <!-- Button Area -->
        <div class="w-full max-w-6xl flex justify-end mt-2 mr-6">
            <Button label="Start" @click="$emit('start')" size="large" class="font-bold !bg-[#146082] !border-[#146082] w-24"/>
        </div>
    </div>
    
</template>

<script setup>
defineEmits(['start'])
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 100%;
}

.home-title {
  font-size: 2rem;
  font-weight: 700;
  color: #971C1C;
  margin-bottom: 2rem;
  font-style: italic;
}

.list-item {
    border: 1px solid #d1d5db; /* gray-300 */
    background-color: #d1d5db; /* gray-300 background based on screenshot */
    border-radius: 4px;
    text-align: left;
    padding: 0.5rem;
    margin-bottom: 1rem;
    list-style: none;
}

.icon-box {
    border: 2px solid #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2rem; 
    height: 2rem;
    flex-shrink: 0;
    margin: 0.5rem;
}

.text-box p {
    margin: 0;
    line-height: 1.5;
}
</style>