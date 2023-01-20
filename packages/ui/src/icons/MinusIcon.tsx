import { IconRoot, IconRootProps } from './Root'

export const MinusIcon = ({ size = '1.5rem', ...props }: IconRootProps) => {
  return (
    <IconRoot
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      size={size}
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.25 7.99881C1.25 7.5846 1.58579 7.24881 2 7.24881H14C14.4142 7.24881 14.75 7.5846 14.75 7.99881C14.75 8.41302 14.4142 8.74881 14 8.74881H2C1.58579 8.74881 1.25 8.41302 1.25 7.99881Z"
        fill="currentColor"
      />
    </IconRoot>
  )
}