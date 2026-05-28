import { Card, BlockStack, InlineStack, ButtonGroup, Button } from "@shopify/polaris";
import { DesktopIcon, MobileIcon } from "@shopify/polaris-icons";

export default function LivePreviewPanel({ 
  sections, 
  selectedSection, 
  setSelectedSection, 
  viewMode, 
  setViewMode 
}) {
  
  const getSectionStyle = (section, isSelected) => {
    const s = section.settings || {};
    const bg = s.background || {};
    const typo = s.typography || {};
    
    return {
      padding: `${bg.padding !== undefined ? bg.padding : 40}px 20px`,
      marginBottom: '0px',
      background: bg.imageUrl 
        ? `url(${bg.imageUrl}) center/cover no-repeat` 
        : bg.gradient || bg.color || '#ffffff',
      opacity: bg.opacity !== undefined ? bg.opacity / 100 : 1,
      borderRadius: `${bg.borderRadius || 0}px`,
      textAlign: typo.textAlign || 'center',
      border: isSelected ? '2px solid #005bd3' : '1px solid transparent',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: typo.color || '#000000',
    };
  };

  const getHeadingStyle = (section) => {
    const typo = section.settings?.typography || {};
    return {
      fontSize: `${typo.fontSize || 24}px`,
      fontWeight: typo.fontWeight || 'bold',
      letterSpacing: `${typo.letterSpacing || 0}px`,
      marginBottom: '10px',
      color: typo.color || '#000000',
    };
  };

  const getButtonStyle = (section) => {
    const btn = section.settings?.button || {};
    const paddingMap = { small: '6px 12px', medium: '10px 20px', large: '14px 28px' };
    return {
      padding: paddingMap[btn.size] || paddingMap.medium,
      background: btn.backgroundColor || '#000000',
      color: btn.textColor || '#ffffff',
      border: `${btn.borderWidth || 0}px solid ${btn.borderColor || 'transparent'}`,
      borderRadius: `${btn.borderRadius || 4}px`,
      width: btn.fullWidth ? '100%' : 'auto',
      cursor: 'pointer',
      transition: btn.hoverAnimation ? 'transform 0.2s, background 0.2s' : 'none',
    };
  };

  const getGridStyle = (section) => {
    const grid = section.settings?.grid || {};
    const cols = viewMode === 'mobile' ? (grid.mobileColumns || 2) : (grid.desktopColumns || 4);
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: `${grid.gap !== undefined ? grid.gap : 20}px`,
      marginTop: '20px',
    };
  };

  const getCardStyle = (section) => {
    const grid = section.settings?.grid || {};
    let radius = 0;
    if (grid.cardShape === 'rounded') radius = 8;
    if (grid.cardShape === 'soft-corners') radius = 16;
    if (grid.cardShape === 'pill') radius = 50;

    return {
      background: grid.cardBackgroundColor || '#f4f4f4',
      borderRadius: `${radius}px`,
      padding: `${grid.padding || 0}px`,
      boxShadow: grid.cardShadow ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
      border: grid.cardBorder ? '1px solid #e1e3e5' : 'none',
      overflow: 'hidden',
      transition: grid.hoverAnimation ? 'transform 0.2s' : 'none',
    };
  };

  const getAspectRatio = (section) => {
    const ratio = section.settings?.grid?.imageRatio || 'square';
    if (ratio === 'portrait') return '2/3';
    if (ratio === 'landscape') return '4/3';
    return '1/1';
  };

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="center" gap="200">
          <ButtonGroup segmented>
            <Button icon={DesktopIcon} pressed={viewMode === 'desktop'} onClick={() => setViewMode('desktop')}>Desktop</Button>
            <Button icon={MobileIcon} pressed={viewMode === 'mobile'} onClick={() => setViewMode('mobile')}>Mobile</Button>
          </ButtonGroup>
        </InlineStack>

        <div style={{ 
          width: viewMode === 'desktop' ? '100%' : '375px', 
          margin: '0 auto', 
          border: '1px solid #e1e3e5', 
          borderRadius: '8px', 
          height: '600px', 
          overflowY: 'auto',
          background: '#fafafa',
          transition: 'width 0.3s ease'
        }}>
          <div>
            {sections.map((section) => (
              <div 
                key={section.id} 
                style={getSectionStyle(section, selectedSection?.id === section.id)}
                onClick={() => setSelectedSection(section)}
              >
                <h2 style={getHeadingStyle(section)}>{section.title || section.type.toUpperCase()}</h2>
                
                {section.description && (
                  <p style={{ marginBottom: '20px', opacity: 0.8 }}>{section.description}</p>
                )}
                
                {section.buttonText && (
                  <div style={{ marginTop: '15px' }}>
                    <button 
                      style={getButtonStyle(section)}
                      onMouseOver={(e) => {
                        const btn = section.settings?.button || {};
                        if (btn.hoverColor) e.target.style.background = btn.hoverColor;
                        if (btn.hoverAnimation) e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        const btn = section.settings?.button || {};
                        e.target.style.background = btn.backgroundColor || '#000000';
                        if (btn.hoverAnimation) e.target.style.transform = 'none';
                      }}
                    >
                      {section.buttonText}
                    </button>
                  </div>
                )}
                
                {(section.type === 'collection' || section.type === 'grid') && (
                  <div style={getGridStyle(section)}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={getCardStyle(section)}>
                        <div style={{
                          width: '100%',
                          aspectRatio: getAspectRatio(section),
                          background: '#e0e0e0',
                          borderRadius: section.settings?.grid?.cardShape === 'pill' ? '50px 50px 0 0' : 
                                        section.settings?.grid?.cardShape === 'rounded' ? '8px 8px 0 0' : 
                                        section.settings?.grid?.cardShape === 'soft-corners' ? '16px 16px 0 0' : '0'
                        }} />
                        <div style={{ padding: '15px' }}>
                          <div style={{ width: '80%', height: '14px', background: '#ccc', marginBottom: '8px', margin: section.settings?.typography?.textAlign === 'center' ? '0 auto 8px auto' : '' }}></div>
                          <div style={{ width: '40%', height: '14px', background: '#ccc', margin: section.settings?.typography?.textAlign === 'center' ? '0 auto' : '' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </BlockStack>
    </Card>
  );
}
