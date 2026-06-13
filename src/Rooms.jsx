import { Text, Html } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

const Wall = ({ position, args, color }) => (
  <RigidBody type="fixed" colliders="cuboid">
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  </RigidBody>
)

const ProjectFrame = ({ position, rotation, title, desc, link, color }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 0, -0.05]}>
      <boxGeometry args={[3, 2, 0.1]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[2.8, 1.8]} />
      <meshStandardMaterial color="#111" />
    </mesh>
    <Text position={[0, 0.5, 0.01]} fontSize={0.25} color={color} anchorY="top">
      {title}
    </Text>
    <Text position={[0, 0, 0.01]} fontSize={0.12} color="white" maxWidth={2.5} textAlign="center">
      {desc}
    </Text>
    <Html position={[0, -0.6, 0.01]} transform distanceFactor={1.5}>
      <a href={link} target="_blank" rel="noopener noreferrer" style={{
        background: color,
        color: 'black',
        padding: '5px 15px',
        textDecoration: 'none',
        borderRadius: '5px',
        fontWeight: 'bold',
        fontSize: '20px',
        pointerEvents: 'auto'
      }}>
        VISIT
      </a>
    </Html>
  </group>
)

export default function Rooms() {
  const wallColor = "#1e1e24"
  const floorColor = "#111"

  return (
    <group>
      {/* Universal Floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[100, 1, 100]} />
          <meshStandardMaterial color={floorColor} roughness={0.4} />
        </mesh>
      </RigidBody>

      {/* Room 1: Intro (Center) */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[9.8, 9.8]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        <Text position={[0, 2, -4.9]} fontSize={0.5} color="#00ffff" outlineWidth={0.02} outlineColor="#000">
          Hi, I'm Santosh
        </Text>
        <Text position={[0, 1.4, -4.9]} fontSize={0.25} color="white">
          Passionate about building cool stuff and
        </Text>
        <Text position={[0, 1.1, -4.9]} fontSize={0.25} color="white">
          turning lifeless sheets of Figma into beautiful
        </Text>
        <Text position={[0, 0.8, -4.9]} fontSize={0.25} color="white">
          and Interactive user interface portals
        </Text>

        <Text position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="#aaa">
          USE WASD & MOUSE
        </Text>

        {/* Walls */}
        <Wall position={[-5, 2, -5]} args={[10, 4, 0.5]} color={wallColor} />
        <Wall position={[5, 2, -5]} args={[10, 4, 0.5]} color={wallColor} />
        <Wall position={[0, 3.5, -5]} args={[2, 1, 0.5]} color={wallColor} />

        <Wall position={[-5, 2, 5]} args={[10, 4, 0.5]} color={wallColor} />
        <Wall position={[5, 2, 5]} args={[10, 4, 0.5]} color={wallColor} />
        <Wall position={[0, 3.5, 5]} args={[2, 1, 0.5]} color={wallColor} />

        <Wall position={[5, 2, -5]} args={[0.5, 4, 10]} color={wallColor} />
        <Wall position={[5, 2, 5]} args={[0.5, 4, 10]} color={wallColor} />
        <Wall position={[5, 3.5, 0]} args={[0.5, 1, 2]} color={wallColor} />

        <Wall position={[-5, 2, -5]} args={[0.5, 4, 10]} color={wallColor} />
        <Wall position={[-5, 2, 5]} args={[0.5, 4, 10]} color={wallColor} />
        <Wall position={[-5, 3.5, 0]} args={[0.5, 1, 2]} color={wallColor} />
      </group>

      {/* Room 2: Skills (North) */}
      <group position={[0, 0, -10]}>
        <mesh position={[0, 0.01, -5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[9.8, 9.8]} />
          <meshStandardMaterial color="#1a2e1a" />
        </mesh>

        <Text position={[0, 3, -9.9]} fontSize={0.6} color="#4ade80">SKILLS</Text>

        <group position={[-2.5, 2, -9.9]}>
          <Text fontSize={0.3} color="#fff" position={[0, 0, 0]}>Languages</Text>
          <Text fontSize={0.15} color="#aaa" position={[0, -0.4, 0]}>JavaScript / TypeScript</Text>
          <Text fontSize={0.15} color="#aaa" position={[0, -0.7, 0]}>Python</Text>
          <Text fontSize={0.15} color="#aaa" position={[0, -1.0, 0]}>Node.js</Text>
        </group>

        <group position={[2.5, 2, -9.9]}>
          <Text fontSize={0.3} color="#fff" position={[0, 0, 0]}>Frameworks</Text>
          <Text fontSize={0.15} color="#aaa" position={[0, -0.4, 0]}>React.js / Next.js</Text>
          <Text fontSize={0.15} color="#aaa" position={[0, -0.7, 0]}>ExpressJS / Redux</Text>
          <Text fontSize={0.15} color="#aaa" position={[0, -1.0, 0]}>Tailwind / MUI</Text>
        </group>

        <Wall position={[0, 2, -10]} args={[10, 4, 0.5]} color={wallColor} />
        <Wall position={[-5, 2, -5]} args={[0.5, 4, 10]} color={wallColor} />
        <Wall position={[5, 2, -5]} args={[0.5, 4, 10]} color={wallColor} />
      </group>

      {/* Room 3: Projects (East) */}
      <group position={[10, 0, 0]}>
        <mesh position={[5, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[9.8, 9.8]} />
          <meshStandardMaterial color="#16213e" />
        </mesh>

        <Text position={[5, 3.2, -4.9]} fontSize={0.6} color="#60a5fa">PROJECTS</Text>

        <ProjectFrame
          position={[2.5, 1.5, -4.9]}
          rotation={[0, 0, 0]}
          title="EMPOWERANGE"
          desc="An aggregation of NGOs all over the country, where you can easily find the NGOs working on different noble causes at one place."
          link="https://www.empowerange.org"
          color="#60a5fa"
        />

        <ProjectFrame
          position={[7.5, 1.5, -4.9]}
          rotation={[0, 0, 0]}
          title="URL SHRINKER"
          desc="A Simple and powerful Link management tool. Development-Stack: MERN"
          link="https://shrinker-client.herokuapp.com/"
          color="#60a5fa"
        />

        <ProjectFrame
          position={[9.9, 1.5, 0]}
          rotation={[0, -Math.PI/2, 0]}
          title="TODO APP"
          desc="A simple tool for time management with features like Authentication, Dark Mode, Cross-Platform app"
          link="https://todo.santoshvijapure.now.sh"
          color="#a78bfa"
        />

        <ProjectFrame
          position={[5, 1.5, 4.9]}
          rotation={[0, Math.PI, 0]}
          title="COVID LETTERS"
          desc="A platform to spread love and positivity through anonymous letters to those fighting against the COVID19 pandemic."
          link="http://covidletters.herokuapp.com/"
          color="#a78bfa"
        />

        <Wall position={[10, 2, 0]} args={[0.5, 4, 10]} color={wallColor} />
        <Wall position={[5, 2, -5]} args={[10, 4, 0.5]} color={wallColor} />
        <Wall position={[5, 2, 5]} args={[10, 4, 0.5]} color={wallColor} />
      </group>

      {/* Room 4: Photos / DB (South) */}
      <group position={[0, 0, 10]}>
        <mesh position={[0, 0.01, 5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[9.8, 9.8]} />
          <meshStandardMaterial color="#3a1a3a" />
        </mesh>

        <Text position={[0, 3, 9.9]} rotation={[0, Math.PI, 0]} fontSize={0.6} color="#f472b6">DATABASES & TOOLS</Text>
        <group position={[0, 1.5, 9.9]} rotation={[0, Math.PI, 0]}>
          <Text fontSize={0.2} color="#fff" position={[0, 0.6, 0]}>Databases</Text>
          <Text fontSize={0.15} color="#aaa" position={[0, 0.2, 0]}>MongoDB  •  MySQL  •  Firebase</Text>

          <Text fontSize={0.2} color="#fff" position={[0, -0.4, 0]}>Testing</Text>
          <Text fontSize={0.15} color="#aaa" position={[0, -0.8, 0]}>Jest  •  Cypress</Text>
        </group>

        <Wall position={[0, 2, 10]} args={[10, 4, 0.5]} color={wallColor} />
        <Wall position={[-5, 2, 5]} args={[0.5, 4, 10]} color={wallColor} />
        <Wall position={[5, 2, 5]} args={[0.5, 4, 10]} color={wallColor} />
      </group>

      {/* Room 5: Contact (West) */}
      <group position={[-10, 0, 0]}>
        <mesh position={[-5, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[9.8, 9.8]} />
          <meshStandardMaterial color="#3a1a1a" />
        </mesh>

        <Text position={[-5, 3, -4.9]} fontSize={0.6} color="#fbbf24">CONTACT & SOCIAL</Text>

        <group position={[-5, 1.5, -4.9]}>
          <Text fontSize={0.2} color="#aaa" position={[0, 0.8, 0]}>Location: Pune, MH, IND</Text>
          <Html position={[-2, 0, 0]} transform distanceFactor={1.5}>
            <a href="https://github.com/santoshvijapure" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', background: '#333', padding: '10px', borderRadius: '5px' }}>GitHub</a>
          </Html>
          <Html position={[0, 0, 0]} transform distanceFactor={1.5}>
            <a href="https://www.linkedin.com/in/santoshvijapure" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', background: '#0077b5', padding: '10px', borderRadius: '5px' }}>LinkedIn</a>
          </Html>
          <Html position={[2, 0, 0]} transform distanceFactor={1.5}>
            <a href="mailto:Vijapuresantosh@gmail.com" style={{ color: '#fff', textDecoration: 'none', background: '#ea4335', padding: '10px', borderRadius: '5px' }}>Email</a>
          </Html>
        </group>

        <Wall position={[-10, 2, 0]} args={[0.5, 4, 10]} color={wallColor} />
        <Wall position={[-5, 2, -5]} args={[10, 4, 0.5]} color={wallColor} />
        <Wall position={[-5, 2, 5]} args={[10, 4, 0.5]} color={wallColor} />
      </group>

      {/* Decorative Lights */}
      <pointLight position={[0, 3, 0]} intensity={10} color="#fff" distance={15} />
      <pointLight position={[0, 3, -10]} intensity={10} color="#4ade80" distance={15} />
      <pointLight position={[10, 3, 0]} intensity={10} color="#60a5fa" distance={15} />
      <pointLight position={[0, 3, 10]} intensity={10} color="#f472b6" distance={15} />
      <pointLight position={[-10, 3, 0]} intensity={10} color="#fbbf24" distance={15} />

    </group>
  )
}
