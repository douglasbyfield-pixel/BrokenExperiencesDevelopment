import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation & Common
      nav: {
        profile: "Profile",
        map: "Map", 
        settings: "Settings",
        report: "Report Issue",
        signOut: "Sign Out"
      },
      
      // Profile Page
      profile: {
        editProfile: "Edit Profile",
        saveChanges: "Save Changes",
        cancel: "Cancel",
        memberSince: "Member since",
        issuesReported: "Issues Reported",
        issuesResolved: "Issues Resolved", 
        totalSponsored: "Total Sponsored",
        impactScore: "Impact Score",
        quickActions: "Quick Actions",
        achievements: "Achievements",
        activityTimeline: "Activity Timeline",
        viewAll: "View All",
        reportNewIssue: "Report New Issue",
        viewMap: "View Map",
        accountSettings: "Account Settings"
      },
      
      // Settings Page
      settings: {
        title: "Settings",
        notifications: "Notifications",
        privacy: "Privacy", 
        display: "Display",
        dangerZone: "Danger Zone",
        emailNotifications: "Email Notifications",
        pushNotifications: "Push Notifications",
        issueUpdates: "Issue Updates",
        weeklyReport: "Weekly Report",
        showProfile: "Show Profile",
        showActivity: "Show Activity",
        showStats: "Show Statistics",
        theme: "Theme",
        language: "Language",
        mapStyle: "Map Style",
        saveSettings: "Save Settings",
        deleteAccount: "Delete Account",
        saving: "Saving..."
      },
      
      // Map Page
      map: {
        searchIssues: "Search issues...",
        showSearch: "Show Search",
        showingIssues: "Showing",
        ofIssues: "of", 
        issues: "issues",
        reported: "Reported",
        inProgress: "In Progress",
        resolved: "Resolved",
        filters: "Filters",
        legend: "Map Legend",
        status: "Status",
        severity: "Severity",
        issueStatus: "Issue Status",
        issueCategories: "Issue Categories",
        severityLevels: "Severity Levels"
      },
      
      // Themes
      theme: {
        light: "Light",
        dark: "Dark", 
        system: "System"
      },
      
      // Languages
      lang: {
        english: "English",
        spanish: "Spanish",
        french: "French"
      },
      
      // Common
      common: {
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel", 
        close: "Close",
        delete: "Delete"
      }
    }
  },
  
  es: {
    translation: {
      // Navigation & Common
      nav: {
        profile: "Perfil",
        map: "Mapa",
        settings: "Configuración", 
        report: "Reportar Problema",
        signOut: "Cerrar Sesión"
      },
      
      // Profile Page
      profile: {
        editProfile: "Editar Perfil",
        saveChanges: "Guardar Cambios",
        cancel: "Cancelar",
        memberSince: "Miembro desde",
        issuesReported: "Problemas Reportados",
        issuesResolved: "Problemas Resueltos",
        totalSponsored: "Total Patrocinado", 
        impactScore: "Puntuación de Impacto",
        quickActions: "Acciones Rápidas",
        achievements: "Logros",
        activityTimeline: "Cronología de Actividad",
        viewAll: "Ver Todo",
        reportNewIssue: "Reportar Nuevo Problema",
        viewMap: "Ver Mapa",
        accountSettings: "Configuración de Cuenta"
      },
      
      // Settings Page
      settings: {
        title: "Configuración",
        notifications: "Notificaciones",
        privacy: "Privacidad",
        display: "Pantalla",
        dangerZone: "Zona Peligrosa",
        emailNotifications: "Notificaciones por Email",
        pushNotifications: "Notificaciones Push",
        issueUpdates: "Actualizaciones de Problemas",
        weeklyReport: "Reporte Semanal",
        showProfile: "Mostrar Perfil",
        showActivity: "Mostrar Actividad", 
        showStats: "Mostrar Estadísticas",
        theme: "Tema",
        language: "Idioma",
        mapStyle: "Estilo de Mapa",
        saveSettings: "Guardar Configuración",
        deleteAccount: "Eliminar Cuenta",
        saving: "Guardando..."
      },
      
      // Map Page
      map: {
        searchIssues: "Buscar problemas...",
        showSearch: "Mostrar Búsqueda",
        showingIssues: "Mostrando",
        ofIssues: "de",
        issues: "problemas",
        reported: "Reportado",
        inProgress: "En Progreso",
        resolved: "Resuelto",
        filters: "Filtros",
        legend: "Leyenda del Mapa",
        status: "Estado",
        severity: "Severidad",
        issueStatus: "Estado del Problema",
        issueCategories: "Categorías de Problemas",
        severityLevels: "Niveles de Severidad"
      },
      
      // Themes
      theme: {
        light: "Claro",
        dark: "Oscuro",
        system: "Sistema"
      },
      
      // Languages
      lang: {
        english: "Inglés",
        spanish: "Español", 
        french: "Francés"
      },
      
      // Common
      common: {
        loading: "Cargando...",
        save: "Guardar",
        cancel: "Cancelar",
        close: "Cerrar",
        delete: "Eliminar"
      }
    }
  },
  
  fr: {
    translation: {
      // Navigation & Common
      nav: {
        profile: "Profil",
        map: "Carte",
        settings: "Paramètres",
        report: "Signaler un Problème",
        signOut: "Se Déconnecter"
      },
      
      // Profile Page
      profile: {
        editProfile: "Modifier le Profil",
        saveChanges: "Enregistrer les Modifications",
        cancel: "Annuler",
        memberSince: "Membre depuis",
        issuesReported: "Problèmes Signalés",
        issuesResolved: "Problèmes Résolus",
        totalSponsored: "Total Sponsorisé",
        impactScore: "Score d'Impact",
        quickActions: "Actions Rapides",
        achievements: "Réalisations",
        activityTimeline: "Chronologie d'Activité",
        viewAll: "Voir Tout",
        reportNewIssue: "Signaler un Nouveau Problème",
        viewMap: "Voir la Carte",
        accountSettings: "Paramètres du Compte"
      },
      
      // Settings Page
      settings: {
        title: "Paramètres",
        notifications: "Notifications",
        privacy: "Confidentialité",
        display: "Affichage",
        dangerZone: "Zone Dangereuse", 
        emailNotifications: "Notifications par Email",
        pushNotifications: "Notifications Push",
        issueUpdates: "Mises à Jour des Problèmes",
        weeklyReport: "Rapport Hebdomadaire",
        showProfile: "Afficher le Profil",
        showActivity: "Afficher l'Activité",
        showStats: "Afficher les Statistiques",
        theme: "Thème",
        language: "Langue",
        mapStyle: "Style de Carte",
        saveSettings: "Enregistrer les Paramètres",
        deleteAccount: "Supprimer le Compte",
        saving: "Enregistrement..."
      },
      
      // Map Page
      map: {
        searchIssues: "Rechercher des problèmes...",
        showSearch: "Afficher la Recherche",
        showingIssues: "Affichage",
        ofIssues: "sur",
        issues: "problèmes",
        reported: "Signalé",
        inProgress: "En Cours", 
        resolved: "Résolu",
        filters: "Filtres",
        legend: "Légende de la Carte",
        status: "Statut",
        severity: "Gravité",
        issueStatus: "Statut du Problème",
        issueCategories: "Catégories de Problèmes",
        severityLevels: "Niveaux de Gravité"
      },
      
      // Themes
      theme: {
        light: "Clair",
        dark: "Sombre",
        system: "Système"
      },
      
      // Languages
      lang: {
        english: "Anglais",
        spanish: "Espagnol",
        french: "Français"
      },
      
      // Common
      common: {
        loading: "Chargement...",
        save: "Enregistrer",
        cancel: "Annuler",
        close: "Fermer",
        delete: "Supprimer"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // default language
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;