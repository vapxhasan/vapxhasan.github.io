document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // 1. LOADING SCREEN & PRELOADER
  // ==========================================
  const loader = document.getElementById("loading-screen");
  const progressBar = document.querySelector(".loader-progress");
  
  if (loader && progressBar) {
    // লোডিং অ্যানিমেশন সিমুলেশন
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          loader.style.opacity = "0";
          setTimeout(() => loader.style.display = "none", 500);
        }, 200);
      }
      progressBar.style.width = `${progress}%`;
    }, 80);
  }

  // ==========================================
  // 2. SCROLL PROGRESS BAR & NAV BACKGROUND
  // ==========================================
  const scrollBar = document.getElementById("scroll-progress");
  const navbar = document.getElementById("navbar");

  window.addEventListener("scroll", () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.pageYOffset / totalHeight) * 100;
      if (scrollBar) scrollBar.style.width = `${progress}%`;
    }

    // স্ক্রল করলে নববার একটু ডার্ক ও ব্লার হবে
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)";
      } else {
        navbar.style.boxShadow = "none";
      }
    }
  });

  // ==========================================
  // 3. MOBILE MENU TOGGLE
  // ==========================================
  const navToggle = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", !expanded);
      mobileMenu.classList.toggle("open");
      
      // হ্যামবার্গার আইকন ট্রানজিশন ইফেক্ট
      const bars = navToggle.querySelectorAll(".toggle-bar");
      if (mobileMenu.classList.contains("open")) {
        bars[0].style.transform = "rotate(45deg) translate(6px, 5px)";
        bars[1].style.opacity = "0";
        bars[2].style.transform = "rotate(-45deg) translate(6px, -5px)";
      } else {
        bars[0].style.transform = "none";
        bars[1].style.opacity = "1";
        bars[2].style.transform = "none";
      }
    });

    // মেনুর লিঙ্কে ক্লিক করলে মোবাইল মেনু বন্ধ হবে
    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.querySelectorAll(".toggle-bar").forEach(b => b.style.transform = "none");
        navToggle.querySelectorAll(".toggle-bar")[1].style.opacity = "1";
      });
    });
  }

  // ==========================================
  // 4. HERO SECTION AUTO-TYPING EFFECT
  // ==========================================
  const typingTextElement = document.getElementById("typing-text");
  const words = ["Web Experiences", "Scalable SaaS code", "UI/UX Solutions", "Next.js Applications"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    if (!typingTextElement) return;
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      typingTextElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingTextElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 120;

    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 1500; // পুরো লেখা শেষ হলে কিছুক্ষণ থামবে
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 400; // নতুন শব্দ শুরুর আগে বিরতি
    }

    setTimeout(typeEffect, typeSpeed);
  }
  
  if (typingTextElement) setTimeout(typeEffect, 1000);

  // ==========================================
  // 5. STATS COUNT-UP ANIMATION
  // ==========================================
  const stats = document.querySelectorAll(".stat-number");
  
  const startCountUp = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = +entry.target.getAttribute("data-count");
        let count = 0;
        const speed = target / 30; // অ্যানিমেশন স্পীড ফিক্সড রাখার জন্য
        
        const updateCount = () => {
          count += speed;
          if (count < target) {
            entry.target.textContent = Math.floor(count);
            requestAnimationFrame(updateCount);
          } else {
            entry.target.textContent = target;
          }
        };
        updateCount();
        observer.unobserve(entry.target); // একবার অ্যানিমেশন হয়ে গেলে অবজার্ভার বন্ধ হবে
      }
    });
  };

  const statObserver = new IntersectionObserver(startCountUp, { threshold: 0.5 });
  stats.forEach(stat => statObserver.observe(stat));

  // ==========================================
  // 6. SCROLL REVEAL ANIMATION (Intersection Observer)
  // ==========================================
  const revealElements = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .skill-bar-fill");
  
  const revealOnScroll = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains("skill-bar-fill")) {
          // স্কিল বারের প্রোগ্রেস অ্যানিমেশন
          const width = entry.target.getAttribute("data-width");
          entry.target.style.width = `${width}%`;
        } else {
          // সাধারণ সেকশন রিভিল অ্যানিমেশন
          entry.target.classList.add("active-reveal");
        }
        observer.unobserve(entry.target);
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealOnScroll, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px" // স্ক্রিনের একটু নিচে থাকতেই অ্যানিমেশন স্টার্ট হবে
  });

  revealElements.forEach(el => revealObserver.observe(el));
});