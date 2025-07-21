    // Curated list of Matterport models (25 examples)
    const models = [
      { id: "zyDSyRXxMH8", title: "Modern Suburban Home", style: "Modern", beds: 3, sqft: 2000, 
        features: ["Open Concept", "Large Windows", "Modern Kitchen"], price: 650000,
        thumb: "https://example.com/modern-thumb1.jpg" },
      { id: "XbSMcFdai3G", title: "Kierland Penthouse", style: "Luxury", beds: 2, sqft: 1406, 
        features: ["City Views", "High-End Finishes", "Balcony"], price: 850000,
        thumb: "https://example.com/luxury-thumb1.jpg" },
      { id: "vNtptZXMm8U", title: "Classic Family Residence", style: "Traditional", beds: 4, sqft: 2500, 
        features: ["Fireplace", "Spacious Rooms", "Traditional Architecture"], price: 550000,
        thumb: "https://example.com/traditional-thumb1.jpg" },
      { id: "snYJsNLhoKV", title: "Farmhouse Retreat", style: "Farmhouse", beds: 5, sqft: 3000, 
        features: ["Large Porch", "Barn Doors", "Rustic Design"], price: 750000,
        thumb: "https://example.com/farmhouse-thumb1.jpg" },
      { id: "e5upBmBFH1Y", title: "Private Luxury Estate", style: "Luxury", beds: 5, sqft: 4000, 
        features: ["Swimming Pool", "Premium Finishes", "Secluded"], price: 1200000,
        thumb: "https://example.com/luxury-thumb2.jpg" },
      // Additional models would be listed here...
    ];

    let answers = {};
    let currentTab = 'local';

    function startWizard() {
      answers = {};
      document.getElementById('modal').style.display = 'block';
      document.querySelectorAll('.question').forEach(q => q.classList.remove('active'));
      document.getElementById('question1').classList.add('active');
    }

    function closeModal() {
      document.getElementById('modal').style.display = 'none';
    }

    function closeGallery() {
      document.getElementById('resultGallery').style.display = 'none';
    }

    function switchTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector(`.tab[onclick="switchTab('${tab}')"]`).classList.add('active');
      // In a full implementation, we would load different models based on the tab
    }

    function selectStyle(style) {
      answers.style = style;
      document.querySelectorAll('.style-option').forEach(el => {
        el.style.border = '2px solid transparent';
      });
      event.currentTarget.style.border = '2px solid var(--primary)';
    }

    function selectBedrooms(beds) {
      answers.beds = beds;
      document.querySelectorAll('#question2 .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
      });
      event.currentTarget.classList.remove('btn-outline');
      event.currentTarget.classList.add('btn-primary');
    }

    function nextQuestion(qNum) {
      const spinner = document.getElementById('spinner');
      const currentQ = document.getElementById(`question${qNum}`);
      const nextQ = document.getElementById(`question${qNum + 1}`);
      
      // Validate current question
      if (qNum === 1 && !answers.style) {
        alert('Please select a house style');
        return;
      }
      if (qNum === 2 && !answers.beds) {
        alert('Please select number of bedrooms');
        return;
      }
      
      spinner.style.display = 'block';
      currentQ.classList.remove('active');
      
      setTimeout(() => {
        spinner.style.display = 'none';
        if (nextQ) {
          nextQ.classList.add('active');
        } else {
          finishWizard();
        }
        
        // Save answers to localStorage
        if (qNum === 3) answers.budget = document.getElementById('budgetSlider').value;
        if (qNum === 4) {
          answers.address = document.getElementById('propertyAddress').value;
          answers.surveyUploaded = document.getElementById('surveyUpload').files.length > 0;
        }
        
        localStorage.setItem('houseAnswers', JSON.stringify(answers));
      }, 1500);
    }

    function finishWizard() {
      // Get user info
      answers.name = document.getElementById('userName').value;
      answers.email = document.getElementById('userEmail').value;
      answers.phone = document.getElementById('userPhone').value;
      
      // Save to IndexedDB
      saveToDatabase(answers);
      
      // Filter matching models
      const matched = models.filter(model => {
        return model.style === answers.style && 
               model.beds >= answers.beds &&
               model.price <= answers.budget * 1.2; // 20% flexibility
      });
      
      // Display results
      showResults(matched);
    }

    function saveToDatabase(data) {
      // In a real implementation, this would use IndexedDB
      console.log('Saving to database:', data);
      localStorage.setItem('houseSelection', JSON.stringify(data));
    }

    function showResults(matchedModels) {
      document.getElementById('modal').style.display = 'none';
      document.getElementById('resultGallery').style.display = 'block';
      document.getElementById('matchCount').textContent = matchedModels.length;
      
      // Update property info
      if (answers.address) {
        document.getElementById('prop-address').textContent = answers.address;
        // In a real implementation, we would fetch parcel data here
        document.getElementById('prop-size').textContent = "0.5 acres (21,780 sq ft)";
        document.getElementById('prop-existing').textContent = "None (New Build)";
        document.getElementById('prop-zoning').textContent = "Residential (RSF3)";
      }
      
      // Display matching homes
      const container = document.getElementById('galleryContent');
      container.innerHTML = '';
      
      matchedModels.forEach(model => {
        const card = document.createElement('div');
        card.className = 'house-card';
        card.innerHTML = `
          <div class="house-preview">
            <iframe src="https://my.matterport.com/show/?m=${model.id}" allowfullscreen></iframe>
            <div class="overlay">
              <h4>${model.title}</h4>
            </div>
          </div>
          <div class="house-details">
            <div class="house-meta">
              <span><i class="fas fa-bed"></i> ${model.beds} Beds</span>
              <span><i class="fas fa-ruler-combined"></i> ${model.sqft} sq ft</span>
              <span>$${model.price.toLocaleString()}</span>
            </div>
            <div class="house-features">
              ${model.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }

    function contactUs() {
      alert('Thank you for your interest! Our team will contact you shortly.');
      closeGallery();
    }

    // Initialize with any saved answers
    window.onload = () => {
      const saved = localStorage.getItem('houseAnswers');
      if (saved) {
        answers = JSON.parse(saved);
      }
    };
