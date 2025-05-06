import { styled } from "@mui/material/styles";
import { Typography, TypographyProps } from "@mui/material";
import { keyframes } from "@mui/material/styles";

const scrollAnimation = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-52.5%); }
`;

interface ScrollTextContainerProps {
  isHovered: boolean;
}

const ScrollTextContainer = styled('div')<ScrollTextContainerProps>(({ isHovered }) => ({
    flex: 1,
  position: 'relative',
  width: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  '& .scrolling-text-inner': {
    display: 'inline-flex',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    '&:hover': {
      animation: isHovered ? `${scrollAnimation} 8s linear infinite` : 'none',
      textOverflow: 'clip',
    }
  }
}));

const ScrollingTypography = styled(Typography)({
  display: 'inline-block',
  whiteSpace: 'nowrap',
  minWidth: 'fit-content',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '&.duplicate': {
    marginLeft: '2em'
  }
});

interface ScrollingTextProps extends TypographyProps {
  text: string;
  maxWidth?: string | number;
}

export const ScrollingText = ({ text, maxWidth = '100%', ...props }: ScrollingTextProps) => {
  // Only trigger animation if text is longer than container
  const shouldAnimate = text.length > 20;
  
  return (
    <ScrollTextContainer isHovered={shouldAnimate} style={{ maxWidth }}>
      <div className="scrolling-text-inner">
        <ScrollingTypography {...props}>
          {text}
        </ScrollingTypography>
        {
            shouldAnimate && (
                <ScrollingTypography {...props} className="duplicate">
                  {text}
                </ScrollingTypography>
            )
        }
      </div>
    </ScrollTextContainer>
  );
};

export default ScrollingText;