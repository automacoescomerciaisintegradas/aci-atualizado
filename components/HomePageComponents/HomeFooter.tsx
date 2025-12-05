import React from 'react';

export const HomeFooter: React.FC = () => {
  return (
    <footer className="mt-12 text-center text-sm text-dark-text-secondary border-t border-dark-border pt-6">
      <p>&copy; {new Date().getFullYear()} ACI. Todos os Direitos Reservados.</p>
      <div className="mt-2 space-x-4">
        <a href="#" className="hover:text-dark-text-primary">Participe da Comunidade</a>
        <a href="#" className="hover:text-dark-text-primary">Guias e Tutoriais</a>
        <a href="#" className="hover:text-dark-text-primary">Suporte</a>
      </div>
    </footer>
  );
};