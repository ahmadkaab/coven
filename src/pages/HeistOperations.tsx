import { useState, useEffect } from 'react';
import {
  Crosshair,
  ShieldCheck,
  ShieldPlus,
  LockKey,
  UsersFour,
  Lightning,
  CheckCircle,
  CurrencyDollar,
  Skull,
  Fingerprint,
  Trophy,
  ArrowRight,
  Sparkle,
  SlidersHorizontal,
} from '@phosphor-icons/react';
import {
  getVaultSecurity,
  purchaseDefenseUpgrade,
  getInsurancePolicies,
  purchaseInsurancePolicy,
  getHeistTargets,
  getCrewMembers,
  calculateHeistOdds,
} from '../services/heistService';
import { BreachSimulationModal } from '../components/heist/BreachSimulationModal';
import { useToast } from '../context/ToastContext';
import { formatTornCash } from '../utils/format';
import type {
  VaultSecurity,
  InsurancePolicy,
  InsuranceTier,
  HeistTarget,
  HeistCrewMember,
  HeistOperation,
} from '../types/heist';

export function HeistOperations() {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'heist' | 'defenses' | 'insurance'>('heist');
  const [vaultSecurity, setVaultSecurity] = useState<VaultSecurity>(getVaultSecurity());
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>(getInsurancePolicies());
  const [targets, setTargets] = useState<HeistTarget[]>(getHeistTargets());
  const [crewPool, setCrewPool] = useState<HeistCrewMember[]>(getCrewMembers());

  const [selectedTarget, setSelectedTarget] = useState<HeistTarget>(getHeistTargets()[0]);
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([
    'crew-01', // Cipher_Zero
    'crew-03', // Boris_The_Lock
    'crew-05', // Tank_Griffin
    'crew-06', // Speedy_Ghost
  ]);

  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  const loadData = () => {
    setVaultSecurity(getVaultSecurity());
    setInsurancePolicies(getInsurancePolicies());
    setTargets(getHeistTargets());
    setCrewPool(getCrewMembers());
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener('coven:heist_update', handler);
    return () => window.removeEventListener('coven:heist_update', handler);
  }, []);

  const activeCrew = crewPool.filter((c) => selectedCrewIds.includes(c.id));
  const odds = calculateHeistOdds(selectedTarget, activeCrew);

  const toggleCrewMember = (id: string) => {
    if (selectedCrewIds.includes(id)) {
      if (selectedCrewIds.length > 1) {
        setSelectedCrewIds(selectedCrewIds.filter((cId) => cId !== id));
      } else {
        addToast('At least one operative is required in the crew.', 'info');
      }
    } else {
      if (selectedCrewIds.length < 4) {
        setSelectedCrewIds([...selectedCrewIds, id]);
      } else {
        addToast('Maximum crew size is 4 operatives.', 'info');
      }
    }
  };

  const handleUpgradeDefense = (upgradeId: string, upgradeName: string, cost: number) => {
    const result = purchaseDefenseUpgrade(upgradeId);
    if (result.success) {
      setVaultSecurity(result.vault);
      addToast(`Installed ${upgradeName}! Breach resistance increased to ${result.vault.breachResistancePct}%.`, 'success');
    }
  };

  const handleSelectPolicy = (tier: InsuranceTier) => {
    const updated = purchaseInsurancePolicy(tier);
    setInsurancePolicies(updated);
    addToast(`Activated Lloyd's ${tier} insurance tier.`, 'success');
  };

  return (
    <main className="page-content">
      <div className="container" style={{ paddingTop: 'var(--sp-6)', paddingBottom: 'var(--sp-16)' }}>
        {/* Top Telemetry Header */}
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--red)',
              letterSpacing: '0.15em',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--red)',
                boxShadow: '0 0 8px var(--red)',
              }}
            />
            [ SYNDICATE SECURITY SECTOR // ART HEISTS & VAULT FORTIFICATIONS ]
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              letterSpacing: '0.03em',
              margin: '0 0 8px 0',
              color: 'var(--chalk)',
            }}
          >
            HEIST OPERATIONS & VAULT DEFENSES
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ghost)', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
            Plan high-stakes tactical infiltrations of rival syndicate strongrooms, fortify your personal Trophy Vault
            with electronic counter-intrusion grids, and secure Lloyd's of Torn indemnity certificates.
          </p>
        </div>

        {/* Aggregate Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: 'var(--sp-8)',
          }}
        >
          <div className="card-industrial" style={{ padding: '16px', background: 'var(--void)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ghost)', marginBottom: '4px' }}>
              <Crosshair size={16} color="var(--red)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>SCOUTED TARGETS</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--chalk)' }}>
              {targets.length} <span style={{ fontSize: '0.75rem', color: 'var(--ghost)', fontWeight: 400 }}>STRONGROOMS</span>
            </div>
          </div>

          <div className="card-industrial" style={{ padding: '16px', background: 'var(--void)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ghost)', marginBottom: '4px' }}>
              <ShieldCheck size={16} color="var(--term-green)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>MY VAULT LEVEL</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--term-green)' }}>
              LEVEL {vaultSecurity.vaultLevel}{' '}
              <span style={{ fontSize: '0.6875rem', color: 'var(--ghost)', fontWeight: 400 }}>
                [{vaultSecurity.breachResistancePct}% RESISTANCE]
              </span>
            </div>
          </div>

          <div className="card-industrial" style={{ padding: '16px', background: 'var(--void)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ghost)', marginBottom: '4px' }}>
              <LockKey size={16} color="#818cf8" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>ACTIVE INSURANCE</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: '#818cf8' }}>
              100%{' '}
              <span style={{ fontSize: '0.75rem', color: 'var(--ghost)', fontWeight: 400 }}>
                LLOYD'S SYNDICATE
              </span>
            </div>
          </div>

          <div className="card-industrial" style={{ padding: '16px', background: 'var(--void)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ghost)', marginBottom: '4px' }}>
              <ShieldPlus size={16} color="#fbbf24" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>ALARM RESPONSE</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>
              {vaultSecurity.alarmResponseTime}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="collector-tabs-nav"
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--wire)',
            marginBottom: 'var(--sp-6)',
            gap: '8px',
          }}
        >
          <button
            className={`collector-tab-btn ${activeTab === 'heist' ? 'active' : ''}`}
            onClick={() => setActiveTab('heist')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === 'heist' ? 'var(--red)' : 'transparent'}`,
              color: activeTab === 'heist' ? 'var(--chalk)' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Crosshair size={14} />
            <span>SYNDICATE HEIST TERMINAL</span>
          </button>

          <button
            className={`collector-tab-btn ${activeTab === 'defenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('defenses')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === 'defenses' ? 'var(--term-green)' : 'transparent'}`,
              color: activeTab === 'defenses' ? 'var(--chalk)' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldPlus size={14} />
            <span>MY VAULT DEFENSES ({vaultSecurity.defenseUpgrades.filter((u) => u.installed).length}/5)</span>
          </button>

          <button
            className={`collector-tab-btn ${activeTab === 'insurance' ? 'active' : ''}`}
            onClick={() => setActiveTab('insurance')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === 'insurance' ? '#818cf8' : 'transparent'}`,
              color: activeTab === 'insurance' ? 'var(--chalk)' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <LockKey size={14} />
            <span>LLOYD'S OF TORN ART INSURANCE</span>
          </button>
        </div>

        {/* TAB 1: HEIST TERMINAL */}
        {activeTab === 'heist' && (
          <div>
            {/* Split View: Target Recon on Left, Crew Roster & Launch on Right */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {/* TARGET RECON SELECTION */}
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.125rem',
                    color: 'var(--chalk)',
                    margin: '0 0 12px 0',
                    letterSpacing: '0.02em',
                  }}
                >
                  1. SELECT TARGET SYNDICATE STRONGROOM
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {targets.map((tgt) => {
                    const isSelected = selectedTarget.id === tgt.id;
                    return (
                      <div
                        key={tgt.id}
                        className="card-industrial"
                        onClick={() => setSelectedTarget(tgt)}
                        style={{
                          background: isSelected ? 'var(--pit)' : 'var(--void)',
                          border: `1px solid ${isSelected ? 'var(--red)' : 'var(--wire)'}`,
                          boxShadow: isSelected ? '0 0 20px rgba(225,29,72,0.2)' : 'none',
                          padding: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <img
                          src={tgt.targetArtwork.imageUrl}
                          alt={tgt.targetArtwork.title}
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '2px',
                            objectFit: 'cover',
                            border: '1px solid var(--wire)',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.625rem',
                                color: 'var(--red)',
                                fontWeight: 700,
                              }}
                            >
                              LVL {tgt.securityLevel} [{tgt.difficulty}]
                            </span>
                            {tgt.factionTag && (
                              <span
                                style={{
                                  background: 'var(--void)',
                                  border: '1px solid var(--wire)',
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.5625rem',
                                  color: 'var(--ghost)',
                                  padding: '1px 4px',
                                }}
                              >
                                [{tgt.factionTag}]
                              </span>
                            )}
                          </div>
                          <h4
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '0.9375rem',
                              margin: '0 0 2px 0',
                              color: 'var(--chalk)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {tgt.targetName}
                          </h4>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                            Loot: {tgt.targetArtwork.title} (${formatTornCash(tgt.targetArtwork.estimatedValue)})
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                            EST. POT
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--term-green)' }}>
                            ${(tgt.estimatedLootValue / 1_000_000).toFixed(0)}M
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CREW ASSEMBLY & MISSION LAUNCH */}
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.125rem',
                    color: 'var(--chalk)',
                    margin: '0 0 12px 0',
                    letterSpacing: '0.02em',
                  }}
                >
                  2. ASSEMBLE SPECIALIST CREW ({activeCrew.length}/4)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {crewPool.map((member) => {
                    const isRecruited = selectedCrewIds.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        className="card-industrial"
                        onClick={() => toggleCrewMember(member.id)}
                        style={{
                          background: isRecruited ? 'var(--pit)' : 'var(--void)',
                          border: `1px solid ${isRecruited ? 'var(--term-green)' : 'var(--wire)'}`,
                          padding: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '2px',
                            objectFit: 'cover',
                            border: `1px solid ${isRecruited ? 'var(--term-green)' : 'var(--wire)'}`,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: isRecruited ? 'var(--chalk)' : 'var(--ghost)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {member.name}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
                            {member.role} ({member.skill}%) • Cut: {member.cutPct}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Operation Briefing & Launch Card */}
                <div
                  className="card-industrial"
                  style={{
                    background: 'var(--pit)',
                    border: '1px solid var(--wire)',
                    padding: '16px',
                    borderRadius: '2px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
                        CALCULATED INFILTRATION CHANCE
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: odds >= 60 ? 'var(--term-green)' : odds >= 40 ? '#fbbf24' : 'var(--red)',
                        }}
                      >
                        {odds}% CHANCE OF SUCCESS
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
                        TOTAL CREW CUT
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--chalk)' }}>
                        {activeCrew.reduce((acc, c) => acc + c.cutPct, 0)}% OF POT
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSimulationOpen(true)}
                    className="btn btn-industrial"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--red)',
                      borderColor: 'var(--red)',
                      color: '#fff',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Crosshair size={16} weight="bold" />
                    <span>LAUNCH TACTICAL INFILTRATION</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY VAULT DEFENSES */}
        {activeTab === 'defenses' && (
          <div>
            {/* Vault Status Hero Banner */}
            <div
              className="card-industrial"
              style={{
                background: 'var(--void)',
                border: '1px solid var(--term-green)',
                boxShadow: '0 0 25px rgba(16,185,129,0.1)',
                padding: '20px',
                marginBottom: 'var(--sp-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--term-green)', letterSpacing: '0.1em' }}>
                  PERSONAL TROPHY VAULT DEFENSE STATUS
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.75rem',
                    color: 'var(--chalk)',
                    margin: '4px 0',
                    letterSpacing: '0.02em',
                  }}
                >
                  {vaultSecurity.ratingName} [LEVEL {vaultSecurity.vaultLevel}]
                </h2>
                <div style={{ fontSize: '0.8125rem', color: 'var(--ghost)' }}>
                  Protected by active infrared perimeter, biometric cipher scanners, and instant police telemetry.
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                  BREACH RESISTANCE
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--term-green)' }}>
                  {vaultSecurity.breachResistancePct}%
                </div>
              </div>
            </div>

            {/* Defensive Upgrades List */}
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--chalk)', margin: '0 0 12px 0' }}>
              HARDWARE & CIPHER COUNTER-MEASURES
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: 'var(--sp-8)' }}>
              {vaultSecurity.defenseUpgrades.map((upg) => (
                <div
                  key={upg.id}
                  className="card-industrial"
                  style={{
                    background: 'var(--void)',
                    border: '1px solid var(--wire)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--chalk)', margin: 0 }}>
                      {upg.name}
                    </h4>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        color: upg.installed ? 'var(--term-green)' : 'var(--ghost)',
                        background: 'var(--pit)',
                        border: '1px solid var(--wire)',
                        padding: '2px 6px',
                      }}
                    >
                      {upg.installed ? 'INSTALLED ✓' : `+${upg.securityBonus}% RESISTANCE`}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--ghost)', margin: '0 0 16px 0', flex: 1, lineHeight: 1.4 }}>
                    {upg.description}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--term-green)', fontWeight: 700 }}>
                      {upg.installed ? 'ACTIVE' : `$${(upg.cost / 1_000_000).toFixed(0)}M TORN $`}
                    </span>

                    {!upg.installed ? (
                      <button
                        type="button"
                        onClick={() => handleUpgradeDefense(upg.id, upg.name, upg.cost)}
                        className="btn btn-industrial"
                        style={{ padding: '6px 12px', fontSize: '0.6875rem' }}
                      >
                        INSTALL UPGRADE
                      </button>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--term-green)' }}>
                        OPERATIONAL
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Intrusions Log */}
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--chalk)', margin: '0 0 12px 0' }}>
              RECENT INFILTRATION INCIDENT LOGS
            </h3>

            <div className="card-industrial" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ background: 'var(--pit)', borderBottom: '1px solid var(--wire)', color: 'var(--ghost)' }}>
                    <th style={{ padding: '12px' }}>DATE</th>
                    <th style={{ padding: '12px' }}>INTRUDER CREW</th>
                    <th style={{ padding: '12px' }}>OUTCOME</th>
                    <th style={{ padding: '12px' }}>PROTECTED VALUE</th>
                    <th style={{ padding: '12px' }}>SECURITY LOG DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {vaultSecurity.recentIntrusions.map((int) => (
                    <tr key={int.id} style={{ borderBottom: '1px solid var(--wire)' }}>
                      <td style={{ padding: '12px', color: 'var(--ghost)' }}>{new Date(int.timestamp).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', color: 'var(--chalk)', fontWeight: 700 }}>
                        {int.intruderCrew} [{int.intruderFaction}]
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            color: 'var(--term-green)',
                            background: 'rgba(16,185,129,0.1)',
                            border: '1px solid var(--term-green)',
                            padding: '2px 6px',
                            fontSize: '0.625rem',
                          }}
                        >
                          {int.outcome}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--term-green)', fontWeight: 700 }}>
                        +${formatTornCash(int.lootProtectedValue)}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--ghost)' }}>{int.log}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INSURANCE */}
        {activeTab === 'insurance' && (
          <div>
            <div style={{ maxWidth: '800px', marginBottom: 'var(--sp-6)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--chalk)', margin: '0 0 6px 0' }}>
                LLOYD'S OF TORN SYNDICATE ART INSURANCE
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', lineHeight: 1.5 }}>
                Underwritten by the city's largest banking cartels. If a masterwork in your Trophy Vault is breached during
                a syndicate heist, Lloyd's guarantees full cash reimbursement directly into your Torn cash balance.
              </p>
            </div>

            {/* Policy Tiers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {insurancePolicies.map((pol) => (
                <div
                  key={pol.id}
                  className="card-industrial"
                  style={{
                    background: pol.active ? 'var(--pit)' : 'var(--void)',
                    border: `1px solid ${pol.active ? '#818cf8' : 'var(--wire)'}`,
                    boxShadow: pol.active ? '0 0 25px rgba(129,140,248,0.2)' : 'none',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        color: pol.active ? '#818cf8' : 'var(--ghost)',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {pol.tier} TIER
                    </span>
                    {pol.active && (
                      <span
                        style={{
                          background: 'rgba(129,140,248,0.15)',
                          border: '1px solid #818cf8',
                          color: '#818cf8',
                          padding: '2px 8px',
                          fontSize: '0.625rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                        }}
                      >
                        CURRENT ACTIVE POLICY
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      color: 'var(--chalk)',
                      margin: '0 0 10px 0',
                    }}
                  >
                    {pol.name}
                  </h3>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                      COVERAGE INDEMNITY
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', color: 'var(--term-green)', fontWeight: 700 }}>
                      {pol.coveragePct}% OF ASSET VALUE
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                      Premium: ${(pol.weeklyPremiumAmount).toLocaleString()} / week
                    </div>
                  </div>

                  <div style={{ flex: 1, marginBottom: '16px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)', marginBottom: '6px' }}>
                      POLICY BENEFITS:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.75rem', color: 'var(--chalk)', lineHeight: 1.6 }}>
                      {pol.features.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    {pol.active ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '10px',
                          background: 'rgba(129,140,248,0.1)',
                          border: '1px solid #818cf8',
                          color: '#818cf8',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        POLICY ACTIVE [{pol.policyNumber}]
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectPolicy(pol.tier)}
                        className="btn btn-industrial"
                        style={{ width: '100%', padding: '10px', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        UPGRADE TO {pol.tier}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Breach Simulation Modal */}
      <BreachSimulationModal
        target={selectedTarget}
        crew={activeCrew}
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        onComplete={() => loadData()}
      />
    </main>
  );
}
