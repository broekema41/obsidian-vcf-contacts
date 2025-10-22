import { init } from "es-module-lexer";
import * as React from "react";
import { photoLineFromV3toV4 } from "src/util/photoLineFromV3toV4";


interface AvatarProps {
	photoUrl?: string;
	firstName: string;
	lastName: string;
  functionalName: string;
}

export const Avatar = (props: AvatarProps) => {
	const [hasImageError, setHasImageError] = React.useState(false);
	let initials = ''

    if (props.firstName && props.lastName) {
      initials =`${props.firstName.charAt(0).toUpperCase()}${props.lastName.charAt(0).toUpperCase()}`;
    } else if (props.functionalName) {
      initials = `${props.functionalName.charAt(0).toUpperCase()}${props.functionalName.charAt(1).toUpperCase()}`;
    }

  React.useEffect(() => {
    setHasImageError(false);
  }, [props.photoUrl]);

  return (
		<div className="avatar-initials">
			{props.photoUrl && !hasImageError ? (
				<img
					src={photoLineFromV3toV4(props.photoUrl)}
					onError={() => setHasImageError(true)}
				/>
			) : (
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 100 100"
					xmlns="http://www.w3.org/2000/svg"
				>
					<text
						x="50%"
						y="50%"
						textAnchor="middle"
						dy=".3em"
						fontSize="30"
					>
						{initials}
					</text>
				</svg>
			)}
		</div>
	);
};

export default Avatar;
