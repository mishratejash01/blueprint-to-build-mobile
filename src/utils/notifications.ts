export const getHumanOrderStatus = (status: string, partnerName?: string) => {
  const statusMessages: Record<string, string> = {
    pending: "We've received your order! 🎉",
    processing: "Your store is packing your items! 📦",
    ready_for_pickup: "Order is ready and waiting! ⏰",
    in_transit: partnerName 
      ? `${partnerName} is on the way! (Est. 8 min) 🚴‍♂️`
      : "Your order is on the way! (Est. 8 min) 🚴‍♂️",
    delivered: "Ding dong! Your groceries are at the door. Enjoy! 🎉",
    cancelled: "Order has been cancelled"
  };

  return statusMessages[status] || "Processing your order...";
};

export const getOrderStatusEmoji = (status: string) => {
  const emojiMap: Record<string, string> = {
    pending: "⏰",
    processing: "📦",
    ready_for_pickup: "✅",
    in_transit: "🚴‍♂️",
    delivered: "✨",
    cancelled: "❌"
  };

  return emojiMap[status] || "📋";
};

export const playOrderSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create a pleasant "cha-ching" sound
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png'
    });
  }
};
