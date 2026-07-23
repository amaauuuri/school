"use client";

type RoleType = "comensal" | "mesero" | "caja" | "dueno";

interface RoleAnimatedIconProps {
  role: RoleType;
}

export function RoleAnimatedIcon({ role }: RoleAnimatedIconProps) {
  return (
    <div className={`role-icon role-icon--${role}`} aria-hidden="true">
      {role === "comensal" && (
        <div className="role-icon__scene">
          <div className="role-icon__table" />
          <div className="role-icon__plate role-icon__float">🍽️</div>
          <div className="role-icon__steam role-icon__steam--1" />
          <div className="role-icon__steam role-icon__steam--2" />
          <div className="role-icon__check role-icon__check--1">✓</div>
        </div>
      )}

      {role === "mesero" && (
        <div className="role-icon__scene">
          <div className="role-icon__phone">📱</div>
          <div className="role-icon__order-slip role-icon__slide">
            <span />
            <span />
            <span />
          </div>
          <div className="role-icon__send-dot" />
        </div>
      )}

      {role === "caja" && (
        <div className="role-icon__scene">
          <div className="role-icon__register">
            <div className="role-icon__register-screen">$</div>
            <div className="role-icon__register-keys" />
          </div>
          <div className="role-icon__card role-icon__float-slow">💳</div>
          <div className="role-icon__coin role-icon__coin--1">💵</div>
        </div>
      )}

      {role === "dueno" && (
        <div className="role-icon__scene">
          <div className="role-icon__chart">
            <div className="role-icon__bar role-icon__bar--1" />
            <div className="role-icon__bar role-icon__bar--2" />
            <div className="role-icon__bar role-icon__bar--3" />
          </div>
          <div className="role-icon__trend role-icon__float-slow">📈</div>
        </div>
      )}
    </div>
  );
}
