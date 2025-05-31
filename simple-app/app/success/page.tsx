'use client'

export default function SuccessPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#e8f5e8',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '60px 40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ fontSize: '120px', marginBottom: '20px' }}>
          😊
        </div>
        
        <h1 style={{ 
          color: '#2ecc71', 
          margin: '0 0 15px 0',
          fontSize: '36px'
        }}>
          Welcome!
        </h1>
        
        <p style={{ 
          color: '#555', 
          fontSize: '18px',
          lineHeight: '1.6',
          margin: '0 0 30px 0'
        }}>
          Access code verified successfully!<br/>
          You're now logged into the Painting Quote App.
        </p>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #e9ecef'
        }}>
          <h3 style={{ color: '#333', margin: '0 0 10px 0' }}>🎉 Success!</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Your app is working perfectly on Replit!<br/>
            Ready for mobile testing.
          </p>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => window.location.href = '/access-code'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Try Again
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}