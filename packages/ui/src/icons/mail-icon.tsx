type IconProps = {
  className?: string
  width?: number
  height?: number
}

export const MailIcon = ({ className, width = 24, height = 24 }: IconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.69112 5.75178C1.25495 6.39249 1 7.16647 1 8V16C1 16.5543 1.11274 17.0822 1.31653 17.5621L7.409 11.4697L1.69112 5.75178ZM5 20C3.89543 20 2.89543 19.5523 2.17157 18.8284L8.46966 12.5303L10.0555 14.1161C11.1294 15.1901 12.8706 15.1901 13.9445 14.1161L15.5303 12.5303L21.8284 18.8284C21.1046 19.5523 20.1046 20 19 20H5ZM22.6835 17.5621C22.8873 17.0822 23 16.5543 23 16V8C23 7.16647 22.745 6.39249 22.3089 5.75178L16.591 11.4697L22.6835 17.5621ZM2.75178 4.69112L11.1161 13.0555C11.6043 13.5436 12.3957 13.5436 12.8839 13.0555L21.2482 4.69112C20.6075 4.25495 19.8335 4 19 4H5C4.16647 4 3.39249 4.25495 2.75178 4.69112Z"
      fill="currentColor"
    />
  </svg>
)
