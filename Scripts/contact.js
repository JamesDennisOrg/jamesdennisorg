document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.button-form').addEventListener('submit', function(e) {
        const submitBtn = this.querySelector('.contact-button');
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loading').style.display = 'inline';
        submitBtn.disabled = true;
    });
});