import {
  BarChart2, FileText, Gavel, Users, Building2, Calendar, Briefcase,
  Landmark, ClipboardList, Scale, Shield, Archive, BookOpen, DollarSign,
  TrendingUp, Star,
} from "lucide-react";

export const CATEGORIA_ICONS = [
  "BarChart2","FileText","Gavel","Users","Building2","Calendar",
  "Briefcase","Landmark","ClipboardList","Scale","Shield","Archive",
  "BookOpen","DollarSign","TrendingUp","Star",
];

export function categoriaIconMap(size = 22): Record<string, React.ReactNode> {
  return {
    BarChart2: <BarChart2 size={size} />, FileText: <FileText size={size} />,
    Gavel: <Gavel size={size} />, Users: <Users size={size} />,
    Building2: <Building2 size={size} />, Calendar: <Calendar size={size} />,
    Briefcase: <Briefcase size={size} />, Landmark: <Landmark size={size} />,
    ClipboardList: <ClipboardList size={size} />, Scale: <Scale size={size} />,
    Shield: <Shield size={size} />, Archive: <Archive size={size} />,
    BookOpen: <BookOpen size={size} />, DollarSign: <DollarSign size={size} />,
    TrendingUp: <TrendingUp size={size} />, Star: <Star size={size} />,
  };
}
