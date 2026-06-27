import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface GenerateRequest {
  prompt: string;
  project_id?: string;
  template?: string;
}

interface GeneratedElement {
  type: string;
  props: Record<string, unknown>;
  styles: Record<string, unknown>;
  children?: GeneratedElement[];
  content?: string;
}

// Template definitions for common SaaS app types
const TEMPLATES: Record<string, { name: string; description: string; elements: GeneratedElement[] }> = {
  crm: {
    name: 'CRM System',
    description: 'Customer Relationship Management',
    elements: [
      {
        type: 'navbar',
        props: { brand: 'CRM Pro', links: ['Dashboard', 'Contacts', 'Deals', 'Reports'] },
        styles: { backgroundColor: '#1a1a2e', color: '#ffffff' },
        children: []
      },
      {
        type: 'container',
        props: { className: 'p-6' },
        styles: {},
        children: [
          {
            type: 'heading',
            props: { level: 1, text: 'Dashboard' },
            styles: { fontSize: '2rem', fontWeight: 'bold' },
            content: 'Dashboard'
          },
          {
            type: 'grid',
            props: { columns: 4 },
            styles: { gap: '1rem' },
            children: [
              { type: 'card', props: { title: 'Total Contacts', value: '2,451' }, styles: {}, content: '2,451' },
              { type: 'card', props: { title: 'Active Deals', value: '128' }, styles: {}, content: '128' },
              { type: 'card', props: { title: 'Revenue', value: '$45,200' }, styles: {}, content: '$45,200' },
              { type: 'card', props: { title: 'Conversion', value: '32%' }, styles: {}, content: '32%' },
            ]
          },
          {
            type: 'table',
            props: { 
              columns: ['Name', 'Email', 'Company', 'Status', 'Value'],
              data: []
            },
            styles: {},
            content: 'Recent Contacts'
          }
        ]
      }
    ]
  },
  ecommerce: {
    name: 'E-Commerce Store',
    description: 'Online shopping platform',
    elements: [
      {
        type: 'navbar',
        props: { brand: 'MyStore', links: ['Home', 'Products', 'Cart', 'Account'] },
        styles: { backgroundColor: '#ffffff', borderBottom: '1px solid #eee' },
        children: []
      },
      {
        type: 'container',
        props: { className: 'p-6' },
        styles: {},
        children: [
          {
            type: 'container',
            props: { className: 'hero-section text-center py-16' },
            styles: { backgroundColor: '#f8f9fa' },
            children: [
              { type: 'heading', props: { level: 1, text: 'Welcome to MyStore' }, styles: {}, content: 'Welcome to MyStore' },
              { type: 'paragraph', props: { text: 'Discover amazing products at great prices' }, styles: {}, content: 'Discover amazing products at great prices' },
              { type: 'button', props: { text: 'Shop Now', variant: 'primary' }, styles: {}, content: 'Shop Now' }
            ]
          },
          {
            type: 'grid',
            props: { columns: 3, title: 'Featured Products' },
            styles: { gap: '1.5rem', padding: '2rem' },
            children: [
              { type: 'card', props: { title: 'Product 1', price: '$29.99', image: '' }, styles: {}, content: 'Product 1' },
              { type: 'card', props: { title: 'Product 2', price: '$49.99', image: '' }, styles: {}, content: 'Product 2' },
              { type: 'card', props: { title: 'Product 3', price: '$19.99', image: '' }, styles: {}, content: 'Product 3' },
            ]
          }
        ]
      },
      {
        type: 'footer',
        props: { links: ['About', 'Contact', 'Privacy', 'Terms'] },
        styles: { backgroundColor: '#1a1a2e', color: '#ffffff' },
        children: []
      }
    ]
  },
  hospital: {
    name: 'Hospital Management',
    description: 'Healthcare management system',
    elements: [
      {
        type: 'navbar',
        props: { brand: 'MedCare HMS', links: ['Dashboard', 'Patients', 'Appointments', 'Staff', 'Reports'] },
        styles: { backgroundColor: '#0066cc', color: '#ffffff' },
        children: []
      },
      {
        type: 'container',
        props: { className: 'p-6' },
        styles: {},
        children: [
          { type: 'heading', props: { level: 1, text: 'Hospital Dashboard' }, styles: {}, content: 'Hospital Dashboard' },
          {
            type: 'grid',
            props: { columns: 4 },
            styles: { gap: '1rem' },
            children: [
              { type: 'card', props: { title: 'Patients Today', value: '156' }, styles: {}, content: '156' },
              { type: 'card', props: { title: 'Appointments', value: '89' }, styles: {}, content: '89' },
              { type: 'card', props: { title: 'Available Beds', value: '42' }, styles: {}, content: '42' },
              { type: 'card', props: { title: 'Staff On Duty', value: '67' }, styles: {}, content: '67' },
            ]
          },
          {
            type: 'table',
            props: { columns: ['Patient', 'Doctor', 'Department', 'Time', 'Status'] },
            styles: {},
            content: 'Today's Appointments'
          }
        ]
      }
    ]
  },
  school: {
    name: 'School Management',
    description: 'Educational institution management',
    elements: [
      {
        type: 'navbar',
        props: { brand: 'EduManager', links: ['Dashboard', 'Students', 'Teachers', 'Classes', 'Grades'] },
        styles: { backgroundColor: '#2d5016', color: '#ffffff' },
        children: []
      },
      {
        type: 'container',
        props: { className: 'p-6' },
        styles: {},
        children: [
          { type: 'heading', props: { level: 1, text: 'School Dashboard' }, styles: {}, content: 'School Dashboard' },
          {
            type: 'grid',
            props: { columns: 4 },
            styles: { gap: '1rem' },
            children: [
              { type: 'card', props: { title: 'Total Students', value: '1,250' }, styles: {}, content: '1,250' },
              { type: 'card', props: { title: 'Teachers', value: '85' }, styles: {}, content: '85' },
              { type: 'card', props: { title: 'Active Classes', value: '42' }, styles: {}, content: '42' },
              { type: 'card', props: { title: 'Avg. Grade', value: 'B+' }, styles: {}, content: 'B+' },
            ]
          }
        ]
      }
    ]
  },
  landing: {
    name: 'Landing Page',
    description: 'Marketing landing page',
    elements: [
      {
        type: 'navbar',
        props: { brand: 'YourBrand', links: ['Features', 'Pricing', 'About', 'Contact'] },
        styles: { backgroundColor: 'transparent', position: 'absolute', width: '100%' },
        children: []
      },
      {
        type: 'container',
        props: { className: 'hero text-center py-24 px-6' },
        styles: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#ffffff' },
        children: [
          { type: 'heading', props: { level: 1, text: 'Build Something Amazing' }, styles: { fontSize: '3.5rem' }, content: 'Build Something Amazing' },
          { type: 'paragraph', props: { text: 'The all-in-one platform for modern teams' }, styles: { fontSize: '1.25rem', opacity: 0.9 }, content: 'The all-in-one platform for modern teams' },
          {
            type: 'flex',
            props: { gap: '1rem', justify: 'center' },
            styles: { marginTop: '2rem' },
            children: [
              { type: 'button', props: { text: 'Get Started Free', variant: 'primary' }, styles: { backgroundColor: '#ffffff', color: '#667eea' }, content: 'Get Started Free' },
              { type: 'button', props: { text: 'Watch Demo', variant: 'outline' }, styles: { borderColor: '#ffffff', color: '#ffffff' }, content: 'Watch Demo' }
            ]
          }
        ]
      },
      {
        type: 'container',
        props: { className: 'features py-16 px-6' },
        styles: {},
        children: [
          { type: 'heading', props: { level: 2, text: 'Why Choose Us' }, styles: { textAlign: 'center' }, content: 'Why Choose Us' },
          {
            type: 'grid',
            props: { columns: 3 },
            styles: { gap: '2rem', marginTop: '3rem' },
            children: [
              { type: 'card', props: { title: 'Fast', description: 'Lightning-fast performance' }, styles: {}, content: 'Fast' },
              { type: 'card', props: { title: 'Secure', description: 'Enterprise-grade security' }, styles: {}, content: 'Secure' },
              { type: 'card', props: { title: 'Scalable', description: 'Grows with your business' }, styles: {}, content: 'Scalable' },
            ]
          }
        ]
      },
      {
        type: 'footer',
        props: { links: ['Privacy', 'Terms', 'Contact'] },
        styles: { backgroundColor: '#1a1a2e', color: '#ffffff' },
        children: []
      }
    ]
  }
};

// AI-powered prompt analysis
function analyzePrompt(prompt: string): { template: string; customizations: string[] } {
  const lower = prompt.toLowerCase();
  
  // Template detection
  let template = 'landing';
  if (lower.includes('crm') || lower.includes('customer') || lower.includes('sales') || lower.includes('pipeline')) {
    template = 'crm';
  } else if (lower.includes('shop') || lower.includes('store') || lower.includes('ecommerce') || lower.includes('product') || lower.includes('buy')) {
    template = 'ecommerce';
  } else if (lower.includes('hospital') || lower.includes('health') || lower.includes('medical') || lower.includes('patient') || lower.includes('clinic')) {
    template = 'hospital';
  } else if (lower.includes('school') || lower.includes('education') || lower.includes('student') || lower.includes('class') || lower.includes('university')) {
    template = 'school';
  } else if (lower.includes('landing') || lower.includes('marketing') || lower.includes('website') || lower.includes('homepage')) {
    template = 'landing';
  }

  // Detect customizations
  const customizations: string[] = [];
  if (lower.includes('dark')) customizations.push('dark-theme');
  if (lower.includes('minimal') || lower.includes('simple')) customizations.push('minimal');
  if (lower.includes('colorful') || lower.includes('vibrant')) customizations.push('colorful');
  if (lower.includes('dashboard')) customizations.push('dashboard-layout');
  if (lower.includes('auth') || lower.includes('login')) customizations.push('auth-pages');

  return { template, customizations };
}

// Apply customizations to template
function applyCustomizations(elements: GeneratedElement[], customizations: string[]): GeneratedElement[] {
  if (customizations.includes('dark-theme')) {
    elements = elements.map(el => ({
      ...el,
      styles: {
        ...el.styles,
        backgroundColor: el.styles.backgroundColor || '#1a1a2e',
        color: el.styles.color || '#e0e0e0'
      }
    }));
  }
  return elements;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // GET /generate-app - List available templates
    if (req.method === 'GET') {
      const templates = Object.entries(TEMPLATES).map(([key, val]) => ({
        id: key,
        name: val.name,
        description: val.description
      }));
      
      return new Response(
        JSON.stringify({ success: true, templates }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /generate-app - Generate app from prompt or template
    if (req.method === 'POST') {
      const body: GenerateRequest = await req.json();
      const { prompt, template } = body;

      let selectedTemplate: string;
      let customizations: string[] = [];

      if (template && TEMPLATES[template]) {
        selectedTemplate = template;
      } else if (prompt) {
        const analysis = analyzePrompt(prompt);
        selectedTemplate = analysis.template;
        customizations = analysis.customizations;
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Either prompt or template is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const templateData = TEMPLATES[selectedTemplate];
      let elements = JSON.parse(JSON.stringify(templateData.elements)); // Deep clone
      elements = applyCustomizations(elements, customizations);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            template: selectedTemplate,
            name: templateData.name,
            description: templateData.description,
            elements,
            prompt_analysis: {
              detected_type: selectedTemplate,
              customizations
            }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
