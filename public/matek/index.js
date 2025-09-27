document.addEventListener('DOMContentLoaded', function() {
        const toggleButtons = document.querySelectorAll('.section-toggle-button');
        toggleButtons.forEach(button => {
            const targetId = button.dataset.target;
            const targetContent = document.getElementById(targetId);
            const chevron = button.querySelector('svg.chevron-icon');

            let sectionOpen = sessionStorage.getItem(targetId + '_open') === 'true';

            if (targetContent) {
                 if (!sectionOpen) {
                    targetContent.classList.add('hidden');
                 }
            }
            if (chevron) {
                 if(!sectionOpen) {
                    chevron.classList.add('rotate-[-90deg]');
                 } else {
                    chevron.classList.remove('rotate-[-90deg]'); // Ensure it's not rotated if open
                 }
            }

            button.addEventListener('click', () => {
                let isOpen = false;
                if (targetContent) {
                    targetContent.classList.toggle('hidden');
                    isOpen = !targetContent.classList.contains('hidden');
                    sessionStorage.setItem(targetId + '_open', isOpen);
                }
                if (chevron) {
                    chevron.classList.toggle('rotate-[-90deg]');
                }
            });
        });
      });