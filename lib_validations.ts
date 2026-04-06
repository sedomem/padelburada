import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email girin"),
  phone: z.string().optional(),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
});

export const reservationSchema = z.object({
  customerName: z.string().min(2, "Ad soyad gerekli"),
  customerEmail: z.string().email("Geçerli email girin"),
  customerPhone: z.string().min(10, "Geçerli telefon girin"),
  playerCount: z.enum(["2", "4"]),
  extraRacket: z.boolean().optional(),
  extraBalls: z.boolean().optional(),
  extraTowel: z.boolean().optional(),
  cardNumber: z.string().min(16, "Kart numarası 16 haneli olmalı"),
  cardExpiry: z.string().min(5, "Son kullanma tarihi girin (AA/YY)"),
  cardCvv: z.string().min(3, "CVV 3 haneli olmalı"),
  cardName: z.string().min(2, "Kart üzerindeki adı girin"),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Yorum en az 10 karakter olmalı").optional(),
});

export const courtSchema = z.object({
  name: z.string().min(3, "Kort adı en az 3 karakter olmalı"),
  description: z.string().optional(),
  address: z.string().min(5, "Adres gerekli"),
  cityId: z.number(),
  districtId: z.number(),
  lat: z.number(),
  lng: z.number(),
  courtType: z.enum(["indoor", "outdoor"]),
  surface: z.enum(["grass", "cement", "rubber"]),
  hasParking: z.boolean(),
  hasShower: z.boolean(),
  hasRacketRental: z.boolean(),
  hasLighting: z.boolean(),
  minPriceHour: z.number().min(1),
  maxPriceHour: z.number().min(1),
  phone: z.string().min(10),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
});
