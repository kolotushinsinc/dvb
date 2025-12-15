'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Slide {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink?: string;
  image: string;
}

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([
    {
      title: "Эксклюзивные очки из Китая",
      subtitle: "Уникальные модели, которых нет больше нигде",
      image: "https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=1200",
      buttonText: "Смотреть коллекцию",
      buttonLink: "/catalog"
    },
    {
      title: "Европейская одежда премиум-класса",
      subtitle: "Качество и стиль от ведущих брендов",
      image: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200",
      buttonText: "Выбрать одежду",
      buttonLink: "/catalog"
    },
    {
      title: "Стильная обувь из Европы и Турции",
      subtitle: "Комфорт и элегантность в каждой паре",
      image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1200",
      buttonText: "Подобрать обувь",
      buttonLink: "/catalog"
    }
  ]);

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.dvberry.ru/api'}/slider`);
        const data = await response.json();
        console.log('Slider data from API:', data);
        if (data.success && data.data?.slides && data.data.slides.length > 0) {
          console.log('Setting slides:', data.data.slides);
          setSlides(data.data.slides);
        }
      } catch (error) {
        console.error('Failed to fetch slides:', error);
        // Keep default slides on error
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[600px] hero-gradient overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="relative h-full flex items-center justify-center text-center text-white px-4">
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                {slide.subtitle}
              </p>
              <Link 
                href={slide.buttonLink && slide.buttonLink.trim() !== '' ? slide.buttonLink : '/catalog'} 
                className="inline-block relative z-20"
                onClick={() => console.log('Clicking link with href:', slide.buttonLink)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button 
                  className="btn-primary px-8 py-4 rounded-lg text-lg font-semibold cursor-pointer"
                >
                  {slide.buttonText}
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
